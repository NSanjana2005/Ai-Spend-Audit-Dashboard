import { supabase } from '../../../lib/supabase';
import { notFound } from 'next/navigation';
import '../../page.css';

// OpenGraph config for the page based on the ID dynamically
export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const { data } = await supabase.from('audits').select('*').eq('id', id).single();

  if (!data) return { title: 'Audit Not Found - Credex' };

  return {
    title: `AI Spend Audit | Found $${data.total_monthly_savings}/mo in savings`,
    description: data.ai_summary || "We analyzed this startup's AI stack to locate significant overspend.",
    openGraph: {
      title: `AI Spend Audit | Saved $${data.total_monthly_savings}/mo`,
      description: data.ai_summary || "We analyzed this startup's AI stack to locate significant overspend.",
      type: 'website',
      siteName: 'Credex Audits',
    },
    twitter: {
      card: 'summary_large_image',
      title: `AI Spend Audit | Saved $${data.total_monthly_savings}/mo`,
    }
  };
}

export default async function SharedAuditPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  // Fetch result side-server
  const { data, error } = await supabase.from('audits').select('*').eq('id', id).single();

  if (error || !data) {
    return (
      <div className="audit-container" style={{ textAlign: 'center', marginTop: '10vh' }}>
        <h1 style={{fontSize: '2rem', marginBottom: '1rem', color: '#0f172a'}}>Audit Not Found</h1>
        <p style={{color: '#64748b'}}>We couldn't locate this audit. Either the link is invalid, or the Database table is missing.</p>
        <p style={{fontSize: '0.85rem', color: '#94a3b8', marginTop: '1rem'}}>(Ensure you created the `audits` table in Supabase!)</p>
      </div>
    );
  }

  const results = data.raw_data?.results || [];
  
  return (
    <div className="audit-container">
      <header className="audit-header">
        <h1>Startup AI Spend Profile</h1>
        <p>A public review of an anonymized stack. Team of {data.team_size}.</p>
      </header>
      
      <div className="summary-cards" style={{maxWidth: '800px', margin: '0 auto'}}>
         <div className="summary-card savings">
           <h4>Audit Monthly Savings</h4>
           <p className="big-number">${data.total_monthly_savings.toFixed(2)}</p>
         </div>
         <div className="summary-card yearly">
           <h4>Projected Yearly</h4>
           <p className="big-number">${(data.total_monthly_savings * 12).toFixed(2)}</p>
         </div>
      </div>

       <div className="panel" style={{maxWidth: '800px', margin: '2rem auto'}}>
         <h2>Audit Summary</h2>
         <p style={{fontSize: '1.05rem', lineHeight: 1.6, color: '#334155'}}>{data.ai_summary}</p>
         
         <h3 style={{marginTop: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem'}}>Tool Breakdown</h3>
         <div className="insight-list">
             {results.map((r: any, i: number) => (
               <div key={i} className={`insight-card ${r.status === 'OPTIMIZED' ? 'status-optimized' : 'status-warning'}`}>
                 <div className="insight-header">
                   <h3>{r.toolName}</h3>
                   <span className={`badge ${r.status.toLowerCase()}`}>{r.status === 'OPTIMIZED' ? 'Optimized' : 'Overspend Detected'}</span>
                 </div>
                 <div className="insight-body">
                   <p className="reason-text"><strong>Analysis:</strong> {r.reason}</p>
                 </div>
               </div>
             ))}
         </div>
         
         <div style={{marginTop: '3rem', textAlign: 'center'}}>
            <a href="/" style={{background: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600}}>
              Run Your Own Free Audit
            </a>
         </div>
       </div>
    </div>
  );
}
