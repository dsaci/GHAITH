import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const ANON_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

async function testLogin() {
  console.log("Attempting login as anas.hallab@ghaith.dz...");
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'anas.hallab@ghaith.dz',
      password: 'Ghaith2026'
    })
  });

  const data = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", data);
}

testLogin();
