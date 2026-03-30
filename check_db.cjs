const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
  console.log('Logging in as admin to check tables...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@ghaith.dz',
    password: 'admin123456'
  });

  if (authError) {
    console.error('Failed to log in:', authError.message);
    return;
  }

  console.log('Login successful. Checking tables...\n');
  let missingTables = [];

  for (const table of tablesToCheck) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log(`❌ Table missing: ${table}`);
        missingTables.push(table);
      } else {
        // Table exists, but maybe RLS or another error
        console.log(`✅ Table exists but returned an error: ${table} (Error: ${error.message})`);
      }
    } else {
      console.log(`✅ Table exists: ${table} (${data.length} rows found in limit=1)`);
    }
  }

  if (missingTables.length > 0) {
    console.log('\n⚠️ Some tables are missing in Supabase:', missingTables.join(', '));
  } else {
    console.log('\n🚀 ALL required tables exist in Supabase!');
  }
}

checkTables();
