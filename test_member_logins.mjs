import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const ANON_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

async function testLogin(email) {
  process.stdout.write(`Testing login for ${email}... `);
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Ghaith2026' })
  });

  if (res.ok) {
    const data = await res.json();
    console.log("✅ SUCCESS");
    
    // Test profile retrieval
    process.stdout.write(`  Fetching profile... `);
    const profRes = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${data.user.id}&select=*`, {
      method: 'GET',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${data.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (profRes.ok) {
      const pData = await profRes.json();
      if (pData.length > 0) {
        console.log(`✅ Profile found: ${pData[0].full_name} (${pData[0].role})`);
      } else {
        console.log("❌ Profile EMPTY");
      }
    } else {
      const err = await profRes.text();
      console.log(`❌ Profile Fetch Failed: ${profRes.status} ${err}`);
    }
  } else {
    const err = await res.text();
    console.log(`❌ Login Failed: ${res.status} ${err}`);
  }
}

const members = [
  'nadjm.saci@ghaith.dz',
  'achwak.j@ghaith.dz',
  'salah.ghadbane@ghaith.dz'
];

(async () => {
  for (const m of members) await testLogin(m);
})();
