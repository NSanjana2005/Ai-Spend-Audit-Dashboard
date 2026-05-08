import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { captureLeadEmail } from '../../../lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { auditId, email, companyName, role, totalSavings, honeypot } = body;

    // Basic Abuse Protection (Honeypot)
    if (honeypot && honeypot.length > 0) {
      // Bot detected filling invisible fields
      return NextResponse.json({ status: "success" }); // silently fail for bots
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Update the Supabase record with the lead PII
    try {
      if (auditId && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-url.supabase.co') {
        const { error } = await supabase.from('audits').update({
          email,
          company_name: companyName,
          role
        }).eq('id', auditId);
        
        if (error) console.error("Lead update error:", error);
      }
    } catch (dbError) {
      console.error("DB update failed:", dbError);
    }

    // 2. Trigger the transactional email
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'placeholder') {
      await captureLeadEmail(email, totalSavings || 0);
    } else {
       console.warn("RESEND_API_KEY missing. Skipping email send.");
    }

    return NextResponse.json({ status: "success", message: "Lead captured successfully!" });

  } catch (error) {
    console.error("Lead API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
