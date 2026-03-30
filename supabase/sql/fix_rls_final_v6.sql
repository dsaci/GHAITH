-- fix_rls_final_v6.sql
-- ═══════════════════════════════════════════════════════════════════
-- GHAYTH PLATFORM — FINAL STABILIZATION
-- Resolves "Database error querying schema" (RLS Recursion)
-- Adds board_member permissions for Dashboard stats
-- ═══════════════════════════════════════════════════════════════════

DO $$ 
DECLARE 
  r RECORD;
BEGIN
  -- 1. Drop all policies on user_profiles to start fresh and avoid recursion
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles' AND schemaname = 'public') 
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON user_profiles', r.policyname);
  END LOOP;

  -- 2. Drop transactions and portal_requests selective policies to update them
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'transactions' AND schemaname = 'public') 
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON transactions', r.policyname);
  END LOOP;
  
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'portal_requests' AND schemaname = 'public') 
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON portal_requests', r.policyname);
  END LOOP;
END $$;

-- ── 3. USER PROFILES FIX (Non-Recursive) ───────────────────────────
-- Use a simple policy that allows reading if it's your own ID, 
-- or if you're a wilaya user (using the SECURITY DEFINER helper which bypasses RLS)

CREATE POLICY "profiles_read_v6" ON user_profiles FOR SELECT USING (
  id = auth.uid() 
  OR is_wilaya_user() -- helper is SECURITY DEFINER, no recursion
);

CREATE POLICY "profiles_update_v6" ON user_profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_insert_v6" ON user_profiles FOR INSERT WITH CHECK (id = auth.uid());

-- ── 4. TRANSACTIONS FIX (Include Board Member) ─────────────────────
CREATE POLICY "transactions_read_v6" ON transactions FOR SELECT USING (
  (get_my_role() IN ('president','vice_president','treasurer','board_member'))
  OR (get_my_role() = 'branch_president' AND branch_id = get_my_branch() AND COALESCE(is_wilaya_level, false) = false)
);

CREATE POLICY "transactions_write_v6" ON transactions FOR ALL USING (
  get_my_role() IN ('president','vice_president','treasurer')
) WITH CHECK (
  get_my_role() IN ('president','vice_president','treasurer')
);

-- ── 5. PORTAL REQUESTS FIX ──────────────────────────────────────────
CREATE POLICY "requests_read_v6" ON portal_requests FOR SELECT USING (
  (get_my_role() IN ('president','vice_president','treasurer','board_member','branch_president'))
  OR (requester_id IN (SELECT id FROM external_users WHERE auth_id = auth.uid()))
);

-- ── 6. FINAL NOTICES ────────────────────────────────────────────────
-- Ensure all authenticated users have usage access to public
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- Re-enable RLS just in case it was toggled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_requests ENABLE ROW LEVEL SECURITY;

SELECT 'Security Final V6 Applied. Recursion broken. Board Member fixed.' as status;
