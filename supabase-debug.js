/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const envConfig = fs.readFileSync('.env.local', 'utf8').split('\n');
envConfig.forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2].trim();
});

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  const log = {};
  
  // Test Read
  const { data: readData, error: readError } = await supabase.from('audits').select('*').limit(1);
  log.readError = readError;
  log.readDataLength = readData ? readData.length : 0;

  // Test Write
  const testId = "c89280d9-b5a8-48b0-9883-ec1dc7b949ab"; 
  const { error: insertError } = await supabase.from('audits').insert({
    id: testId,
    team_size: 1,
    total_monthly_spend: 0,
    total_monthly_savings: 0,
    ai_summary: 'test',
    raw_data: {}
  });
  log.insertError = insertError;
  
  if (!insertError) {
    await supabase.from('audits').delete().eq('id', testId);
  }

  fs.writeFileSync('db-error-logs.json', JSON.stringify(log, null, 2));
  console.log("Logged to db-error-logs.json");
}

testSupabase();
