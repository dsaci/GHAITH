import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].replace('\r','').trim();
const ANON_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].replace('\r','').trim();

const tablesToCheck = [
  'user_profiles',
  'bylaw_articles',
  'bylaw_acknowledgments',
  'login_history',
  'external_users',
  'branches',
  'municipalities',
  'inventory',
  'inventory_movements',
  'families',
  'donors',
  'volunteer_logs'
];

async function checkTables() {
  console.log("-----------------------------------------");
  console.log('Checking individual tables exist by pinging HTTP endpoints...');
  console.log("-----------------------------------------");

  for (const table of tablesToCheck) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
      });

      if (response.ok) {
        console.log(`✅ Table exists: ${table} (HTTP 200 OK)`);
      } else {
        const errData = await response.json();
        // If 404, or specific message saying relation doesn't exist
        if (response.status === 404 || errData.code === '42P01') {
          console.log(`❌ Table missing: ${table} (Error: ${errData.message || response.statusText})`);
        } else {
          // It exists but RLS block or something else (like 401/403)
          console.log(`✅ Table exists: ${table} (HTTP ${response.status}) (RLS active, which is fine)`);
        }
      }
    } catch (err) {
      console.log(`❌ Network or fetch error on ${table}:`, err.message);
    }
  }
}

checkTables();
