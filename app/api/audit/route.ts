import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { openai } from '../../../lib/openai';
import { AuditInput, AuditContext, AuditResult } from '../../../auditEngine';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tools, context, results } = body as { tools: AuditInput[], context: AuditContext, results: AuditResult[] };

    const totalSavings = results.reduce((acc, r) => acc + r.potentialSavings, 0);

    // Call Anthropic to generate the AI personalized summary
    let aiSummary = "Your AI spend has been audited. We found some optimization opportunities across your tool stack.";
    
    try {
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'placeholder') {
        const prompt = `You are a financial operator at a B2B SaaS startup. You just audited a company's software spend.
          Context: A team of ${context.totalTeamSize} primarily focused on ${context.primaryUseCase}.
          Current tools: ${tools.map(t => t.toolName).join(', ')}.
          Total monthly savings opportunity: $${totalSavings}.
          Write a concise, 100-word personalized summary to the founder explaining where their money is going and hinting at why they should care. 
          Be conversational and direct, not overly robotic. Do not mention specific plan prices, just general strategic advice based on the tools selected.`;
        
        const response = await openai.chat.completions.create({
          max_tokens: 250,
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert SaaS infrastructure auditor.' },
            { role: 'user', content: prompt }
          ]
        });
        
        aiSummary = response.choices[0].message.content || aiSummary;
      }
    } catch (llmError) {
      console.error("LLM Generation Failed (Graceful Fallback applied):", llmError);
    }

    // Prepare audit record for Supabase
    // If the tables aren't set up, this will naturally fail, but we'll return the AI summary anyway to not break the UI.
    const recordId = crypto.randomUUID();
    let dbSuccess = false;

    try {
      const { error } = await supabase.from('audits').insert({
        id: recordId,
        team_size: context.totalTeamSize,
        total_monthly_spend: tools.reduce((acc, t) => acc + t.monthlySpend, 0),
        total_monthly_savings: totalSavings,
        ai_summary: aiSummary,
        raw_data: { tools, context, results } // JSONB column
      });
      if (!error) {
        dbSuccess = true;
      } else {
        console.error("Supabase insert errored. Did you create the 'audits' table?", error);
      }
    } catch (dbError) {
      console.error("Database connection failed. Ensure env vars are set:", dbError);
    }

    return NextResponse.json({ 
      id: recordId, 
      aiSummary,
      dbSuccess 
    });

  } catch (error) {
    console.error("Audit API Error:", error);
    return NextResponse.json({ error: "Failed to process audit" }, { status: 500 });
  }
}
