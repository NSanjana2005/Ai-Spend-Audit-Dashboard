"use client";

import React, { useState, useEffect } from "react";
import { runAuditCycle, AuditInput, AuditContext, AuditResult } from "../auditEngine";
import "./page.css";

const TOOL_OPTIONS = ["Cursor", "GitHub Copilot", "Claude", "ChatGPT", "Anthropic API direct", "OpenAI API direct", "Gemini", "Windsurf", "v0"];
const PLAN_OPTIONS_MAP: Record<string, string[]> = {
  "Cursor": ["Hobby", "Pro", "Business", "Enterprise"],
  "GitHub Copilot": ["Individual", "Business", "Enterprise"],
  "Claude": ["Free", "Pro", "Max", "Team", "Enterprise", "API direct"],
  "ChatGPT": ["Plus", "Team", "Enterprise", "API direct"],
  "Gemini": ["Pro", "Ultra", "API"],
  "Windsurf": ["Hobby", "Pro", "Team", "Enterprise"],
  "v0": ["Free", "Premium", "Team"],
  "Default": ["Free", "Pro", "Team", "Enterprise", "Pay-as-you-go"]
};

// Default fallback for strictly typeless API
const getPlansFor = (tool: string) => PLAN_OPTIONS_MAP[tool] || PLAN_OPTIONS_MAP["Default"];

const USE_CASES = ["Coding", "Writing", "Research", "Data", "Mixed"] as const;

export default function AuditDashboard() {
  const [context, setContext] = useState<AuditContext>(() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("credex_context");

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { totalTeamSize: 5, primaryUseCase: "Coding" };
      }
    }
  }

  return { totalTeamSize: 5, primaryUseCase: "Coding" };
});

const [tools, setTools] = useState<AuditInput[]>(() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("credex_tools");

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [
          {
            toolName: "ChatGPT",
            currentPlan: "Enterprise",
            monthlySpend: 60,
            users: 1,
          },
        ];
      }
    }
  }

  return [
    {
      toolName: "ChatGPT",
      currentPlan: "Enterprise",
      monthlySpend: 60,
      users: 1,
    },
  ];
});
  const [results, setResults] = useState<AuditResult[] | null>(null);
  
  const [isAuditing, setIsAuditing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [shareableId, setShareableId] = useState<string | null>(null);
  
  // Lead capture state
  const [leadFields, setLeadFields] = useState({ email: '', companyName: '', role: '', honeypot: '' });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('credex_tools', JSON.stringify(tools));
    localStorage.setItem('credex_context', JSON.stringify(context));
  }, [tools, context]);

  const handleContextChange = (field: keyof AuditContext, value: string | number) => {
    setContext({ ...context, [field]: value });
  };

  const handleToolChange = (index: number, field: keyof AuditInput, value: string | number) => {
    const updated = [...tools];
    updated[index] = { ...updated[index], [field]: value };
    // Trigger reset of plan if tool changes to a mismatching plan mapping
    if (field === 'toolName') {
        const allowedPlans = getPlansFor(value as string);
        if (!allowedPlans.includes(updated[index].currentPlan)) updated[index].currentPlan = allowedPlans[0];
    }
    setTools(updated);
  };

  const addTool = () => {
    setTools([...tools, { toolName: "Claude", currentPlan: "Pro", monthlySpend: 20, users: 1 }]);
  };

  const removeTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const runAudit = async () => {
    setIsAuditing(true);
    setResults(null);
    setAiSummary("");
    setShareableId(null);
    
    // Client-side execution of heavy mathematical audit
    const generatedResults = runAuditCycle(tools, context);
    
    try {
      // Async call for LLM generated summary & DB record creation
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools, context, results: generatedResults })
      });
      const data = await res.json();
      setAiSummary(data.aiSummary || "Audit generated successfully. Expand below to view details.");
      if (data.id) setShareableId(data.id);
    } catch (err) {
      console.error(err);
      setAiSummary("Your AI spend has been accurately calculated, but we were unable to generate the deeply personalized AI summary component. See the breakdown below.");
    } finally {
      setResults(generatedResults);
      setIsAuditing(false);
    }
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadLoading(true);
    try {
       await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             auditId: shareableId,
             email: leadFields.email,
             companyName: leadFields.companyName,
             role: leadFields.role,
             totalSavings: totalMonthlySavings,
             honeypot: leadFields.honeypot
          })
       });
       setLeadSubmitted(true);
    } catch (err) {
       console.error("Lead submission error", err);
    }
    setLeadLoading(false);
  };

  const totalMonthlySavings = results ? results.reduce((acc, r) => acc + r.potentialSavings, 0) : 0;
  const totalYearlySavings = totalMonthlySavings * 12;

  return (
    <div className="audit-container">
      <header className="audit-header">
        <h1>AI Spend Audit Engine</h1>
        <p>Intelligently analyze your startup&apos;s AI software spend and optimize your subscription limits.</p>
      </header>

      <div className="audit-grid">
        <section className="config-section panel">
          <h2>1. Define Your Setup</h2>
          <div className="context-card section-card">
            <h3>Company Context</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Total Team Size</label>
                <input type="number" min="1" value={context.totalTeamSize} onChange={e => handleContextChange("totalTeamSize", parseInt(e.target.value) || 1)} />
              </div>
              <div className="form-group">
                <label>Primary Use Case</label>
                <select value={context.primaryUseCase} onChange={e => handleContextChange("primaryUseCase", e.target.value)}>
                  {USE_CASES.map(uc => <option key={uc} value={uc}>{uc}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="tools-list section-card">
            <h3>Current AI Stack</h3>
            {tools.map((t, index) => (
              <div key={index} className="tool-row animate-in">
                <div className="tool-inputs">
                  <div className="form-group">
                    <label>Tool Name</label>
                    <select value={t.toolName} onChange={e => handleToolChange(index, "toolName", e.target.value)}>
                      {TOOL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Current Plan</label>
                    <select value={t.currentPlan} onChange={e => handleToolChange(index, "currentPlan", e.target.value)}>
                      {getPlansFor(t.toolName).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Users/Seats</label>
                    <input type="number" min="1" value={t.users} onChange={e => handleToolChange(index, "users", parseInt(e.target.value) || 1)} />
                  </div>
                  <div className="form-group">
                    <label>Monthly Spend ($)</label>
                    <input type="number" min="0" value={t.monthlySpend} onChange={e => handleToolChange(index, "monthlySpend", parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
                <button className="icon-btn remove-btn" onClick={() => removeTool(index)}>✕</button>
              </div>
            ))}
            <button className="add-tool-btn" onClick={addTool}>+ Add Another Tool</button>
          </div>
          <button className="run-audit-btn" onClick={runAudit} disabled={isAuditing || tools.length === 0}>
            {isAuditing ? 'Analyzing Models & Spend...' : 'Run Spend Audit'}
          </button>
        </section>

        <section className="results-section panel">
          <h2>2. Audit Results</h2>
          {!results && !isAuditing && (
            <div className="empty-state">
              <div className="pulse-circle"></div>
              <p>Configure your tools and run the audit to see savings opportunities.</p>
            </div>
          )}
          {isAuditing && (
            <div className="empty-state">
              <div className="spinner"></div>
              <p>Evaluating LLM usage and overpack bounds...</p>
            </div>
          )}
          
          {results && !isAuditing && (
            <div className="results-dashboard animate-in">
              {aiSummary && (
                <div className="ai-summary section-card" style={{backgroundColor: '#e0e7ff', borderColor: '#c7d2fe', padding: '1rem'}}>
                   <h3 style={{marginTop:0, marginBottom:'0.5rem', fontSize:'0.9rem', color:'#4338ca'}}>✨ AI Executive Summary</h3>
                   <p style={{fontSize:'0.9rem', color:'#312e81', margin:0, lineHeight:'1.5'}}>{aiSummary}</p>
                </div>
              )}

              <div className="summary-cards">
                <div className="summary-card savings">
                  <h4>Monthly Savings</h4>
                  <p className="big-number">${totalMonthlySavings.toFixed(2)}</p>
                </div>
                <div className="summary-card yearly">
                  <h4>Projected Yearly</h4>
                  <p className="big-number">${totalYearlySavings.toFixed(2)}</p>
                </div>
              </div>

              {totalMonthlySavings > 500 && (
                <div style={{background: '#fef2f2', padding: '1.25rem', borderRadius: '8px', borderLeft: '5px solid #ef4444', marginBottom: '1.5rem'}}>
                  <h3 style={{margin: '0 0 0.5rem 0', color: '#991b1b', fontSize: '1.1rem'}}>🚨 Massive Savings Opportunity Detected</h3>
                  <p style={{margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#7f1d1d'}}>Your enterprise scale warrants heavily discounted bulk credits. <strong>Credex</strong> connects platforms with pooled volume to cut this exact overhead.</p>
                  <a href="#claim" style={{background: '#b91c1c', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.95rem', fontWeight:'600'}}>Talk to Credex Savings Experts</a>
                </div>
              )}

              {totalMonthlySavings < 100 && totalMonthlySavings >= 0 && (
                <div style={{background: '#f0fdf4', padding: '1.25rem', borderRadius: '8px', borderLeft: '5px solid #10b981', marginBottom: '1.5rem'}}>
                  <h3 style={{margin: '0 0 0.5rem 0', color: '#064e3b', fontSize: '1.1rem'}}>✅ You are spending well.</h3>
                  <p style={{margin: '0', fontSize: '0.95rem', color: '#065f46'}}>Your unit economics look clean with no major enterprise overkill. Keep it up!</p>
                </div>
              )}

              <div className="insight-list" style={{marginBottom: '2rem'}}>
                {results.map((r, i) => (
                  <div key={i} className={`insight-card ${r.status === 'OPTIMIZED' ? 'status-optimized' : 'status-warning'}`}>
                    <div className="insight-header">
                      <h3>{r.toolName}</h3>
                      <span className={`badge ${r.status.toLowerCase()}`}>{r.status === 'OPTIMIZED' ? 'Optimized' : 'Overspend Detected'}</span>
                    </div>
                    <div className="insight-body">
                      {r.status === 'OPTIMIZED' ? (
                        <p className="reason-text">✅ {r.reason}</p>
                      ) : (
                        <div className="actionable-content">
                          <div className="spend-comparison">
                            <div className="spend-col">
                              <span className="spend-label">Current ({r.currentPlan})</span>
                              <span className="spend-value strike">${r.currentSpend}/mo</span>
                            </div>
                            <div className="arrow">→</div>
                            <div className="spend-col target">
                              <span className="spend-label">Recommended ({r.recommendedPlan})</span>
                              <span className="spend-value">${r.recommendedSpend}/mo</span>
                            </div>
                          </div>
                          <p className="reason-text">💡 <strong>Reason:</strong> {r.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!leadSubmitted ? (
                 <div className="section-card" id="claim" style={{border: '1px solid #e2e8f0', background: '#f8fafc', padding: '1.5rem', textAlign: 'center'}}>
                    <h3 style={{marginBottom: '0.25rem', color:'#0f172a'}}>Keep this audit on hand</h3>
                    <p style={{fontSize:'0.9rem', color:'#64748b', marginBottom:'1rem'}}>We&apos;ll email you a copy of these insights. Plus, we&apos;ll notify you when cheaper models drop.</p>
                    <form onSubmit={submitLead} style={{display:'flex', flexDirection:'column', gap:'0.75rem', alignItems:'center'}}>
                      <input type="text" name="honeypotid" value={leadFields.honeypot} onChange={e => setLeadFields({...leadFields, honeypot: e.target.value})} style={{display:'none'}} tabIndex={-1} autoComplete="off" />
                      
                      <div style={{display:'flex', gap:'0.75rem', width:'100%', maxWidth:'500px'}}>
                         <input type="text" placeholder="Company Name" required value={leadFields.companyName} onChange={e => setLeadFields({...leadFields, companyName: e.target.value})} style={{flex: 1}} />
                         <input type="text" placeholder="Your Role (e.g. CTO)" required value={leadFields.role} onChange={e => setLeadFields({...leadFields, role: e.target.value})} style={{flex: 1}} />
                      </div>
                      
                      <div style={{display:'flex', gap:'0.75rem', width:'100%', maxWidth:'500px'}}>
                         <input type="email" placeholder="founder@company.com" required value={leadFields.email} onChange={e => setLeadFields({...leadFields, email: e.target.value})} style={{flex: 1}} />
                         <button type="submit" disabled={leadLoading} style={{background: '#2563eb', color: '#fff', border:'none', padding:'0 1.5rem', borderRadius:'6px', fontWeight:'600', cursor:'pointer'}}>
                            {leadLoading ? '...' : 'Send my report'}
                         </button>
                      </div>
                    </form>
                 </div>
              ) : (
                 <div className="section-card" style={{border: '1px solid #bbf7d0', background: '#f0fdf4', padding: '1.5rem', textAlign: 'center'}}>
                    <h3 style={{color:'#166534', margin:0}}>Check your inbox!</h3>
                    <p style={{color:'#15803d', fontSize:'0.9rem', marginBottom:0}}>We&apos;ve sent your detailed breakdown.</p>
                 </div>
              )}

              {shareableId && (
                  <div style={{marginTop: '1rem', textAlign:'center'}}>
                    <a href={`/share/${shareableId}`} target="_blank" rel="noreferrer" style={{color: '#2563eb', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 600}}>
                      🔗 Get Shareable Public Link
                    </a>
                  </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
