-- fix_rls_recursion.sql
-- ═══════════════════════════════════════════════════════════════════
-- Resolves "Database error querying schema" and circular dependencies
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Create Security Definer Helpers ──────────────────────────────
-- These functions run with the privileges of the creator (postgres)
-- and thus bypass RLS on the tables they query.

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_my_branch()
RETURNS UUID AS $$
  SELECT branch_id FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_wilaya_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('president', 'vice_president', 'treasurer', 'board_member', 'secretary')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ── 2. Reset Policies on user_profiles ─────────────────────────────
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_self_read" ON public.user_profiles;
CREATE POLICY "profiles_self_read" ON public.user_profiles 
FOR SELECT USING (id = auth.uid() OR is_wilaya_user());

DROP POLICY IF EXISTS "profiles_self_update" ON public.user_profiles;
CREATE POLICY "profiles_self_update" ON public.user_profiles 
FOR UPDATE USING (id = auth.uid());

-- ── 3. Reset Policies on audit_logs & login_history ────────────────
-- Allow anyone authenticated to insert logs (needed for login tracking)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_insert_policy" ON public.audit_logs;
CREATE POLICY "audit_insert_policy" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "login_insert_policy" ON public.login_history;
CREATE POLICY "login_insert_policy" ON public.login_history FOR INSERT TO authenticated WITH CHECK (true);

-- ── 4. Grant Permissions ──────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
