import { Resend } from 'resend';

// Make sure to add RESEND_API_KEY to your .env.local
export const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder');

export async function captureLeadEmail(email: string, totalSavings: number) {
  try {
    const data = await resend.emails.send({
      from: 'Credex Audits <onboarding@resend.dev>', // Must be a verified domain in actual production
      to: [email],
      subject: 'Your Personalized AI Spend Audit Results',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Your AI Spend Audit</h2>
          <p>Thank you for using the AI Audit tool.</p>
          <p>We detected that you could save <strong>$${totalSavings}/mo</strong> on your current AI infrastructure setup.</p>
          ${totalSavings > 100 
            ? '<p>Because you have significant AI spend, <strong>Credex</strong> can provide heavily discounted enterprise credits for Claude, ChatGPT, Cursor, and more. Reply to this email to claim your savings!</p>'
            : '<p>You are running a relatively optimized stack, but keep an eye out as your team scales. We will notify you when new optimizations emerge!</p>'
          }
        </div>
      `
    });
    return data;
  } catch (error) {
    console.error("Resend API Email Failed:", error);
    return null;
  }
}
