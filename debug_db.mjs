import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function check() {
  console.log('Checking volunteers table structure...');
  const { data: volData, error: volErr } = await supabase
    .from('volunteers')
    .select('*')
    .limit(1);
    
  if (volErr) {
    console.error('Error fetching volunteers:', volErr.message);
  } else {
    console.log('Volunteers columns:', Object.keys(volData[0] || {}));
  }

  console.log('\nTesting anon insert into external_users...');
  const { error: insErr } = await supabase
    .from('external_users')
    .insert([{ 
      full_name: 'Test Debug', 
      phone: '0000000000', 
      portal_type: 'volunteer',
      status: 'pending' 
    }]);

  if (insErr) {
    console.error('Anon insert FAILED:', insErr.message);
  } else {
    console.log('Anon insert SUCCESSFUL!');
    // Cleanup
    await supabase.from('external_users').delete().eq('full_name', 'Test Debug');
  }
}

check();
