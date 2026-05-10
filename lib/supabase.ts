import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Define type helper for Audits Table to simplify usage
export interface AuditRecord {
  id?: string; // UUID
  email?: string;
  company_name?: string;
  role?: string;
  team_size: number;
  total_monthly_spend: number;
  total_monthly_savings: number;
  ai_summary: string;
  raw_data: Record<string, unknown>;
  created_at?: string;
}
