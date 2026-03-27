-- ═══════════════════════════════════════════════════════════════════
-- GHAYTH PLATFORM — PHASE 2 RLS (run AFTER phase1_schema.sql)
-- Drops policies if re-running (idempotent-ish)
-- ═══════════════════════════════════════════════════════════════════

-- ── Helper: drop all policies on a table (Postgres 15+ use generic approach)
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN (
      'user_profiles','families','family_benefits','members','transactions',
      'mail_registry','meetings','inventory','inventory_movements','occasions',
      'documents','saved_reports','external_users','volunteers','volunteer_logs',
      'donor_profiles','beneficiary_portal','portal_requests','honor_wall',
      'notifications','audit_logs','report_reminders','donors','municipalities','branches'
    )
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

ALTER TABLE municipalities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches               ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE families               ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_benefits        ENABLE ROW LEVEL SECURITY;
ALTER TABLE members                ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_registry          ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings               ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory              ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE occasions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents              ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_reports          ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiary_portal     ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_requests        ENABLE ROW LEVEL SECURITY;
ALTER TABLE honor_wall             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_reminders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors                 ENABLE ROW LEVEL SECURITY;

-- ── HELPER FUNCTIONS (SECURITY DEFINER) ─────────────────────────────
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION get_my_branch()
RETURNS UUID AS $$
  SELECT branch_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION is_wilaya_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('president','vice_president','treasurer','board_member')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION is_top_management()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('president','vice_president','treasurer')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- ── Reference data: authenticated can read municipalities & branches ─
CREATE POLICY "municipalities_read" ON municipalities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "branches_read" ON branches FOR SELECT USING (
  is_top_management()
  OR get_my_role() = 'board_member'
  OR (get_my_role() = 'branch_president' AND id = get_my_branch())
);

-- ── FAMILIES ────────────────────────────────────────────────────────
CREATE POLICY "families_access" ON families FOR SELECT USING (
  CASE COALESCE(get_my_role(), '')
    WHEN 'president' THEN true
    WHEN 'vice_president' THEN true
    WHEN 'treasurer' THEN true
    WHEN 'board_member' THEN true
    WHEN 'branch_president' THEN branch_id = get_my_branch()
    ELSE false
  END
  AND is_deleted = false
);

CREATE POLICY "families_insert" ON families FOR INSERT WITH CHECK (
  COALESCE(get_my_role(), '') IN (
    'president','vice_president','board_member','branch_president'
  )
);

CREATE POLICY "families_update" ON families FOR UPDATE USING (
  CASE COALESCE(get_my_role(), '')
    WHEN 'president' THEN true
    WHEN 'vice_president' THEN true
    WHEN 'board_member' THEN true
    WHEN 'branch_president' THEN branch_id = get_my_branch()
    ELSE false
  END
);

-- ── TRANSACTIONS ───────────────────────────────────────────────────
CREATE POLICY "transactions_access" ON transactions FOR SELECT USING (
  CASE COALESCE(get_my_role(), '')
    WHEN 'president' THEN true
    WHEN 'vice_president' THEN true
    WHEN 'treasurer' THEN true
    WHEN 'branch_president' THEN
      branch_id = get_my_branch()
      AND COALESCE(is_wilaya_level, false) = false
    ELSE false
  END
  AND is_deleted = false
);

CREATE POLICY "transactions_insert" ON transactions FOR INSERT WITH CHECK (
  CASE COALESCE(get_my_role(), '')
    WHEN 'president' THEN true
    WHEN 'vice_president' THEN true
    WHEN 'treasurer' THEN true
    WHEN 'branch_president' THEN
      branch_id = get_my_branch()
      AND COALESCE(is_wilaya_level, false) = false
    ELSE false
  END
);

CREATE POLICY "transactions_update" ON transactions FOR UPDATE USING (
  CASE COALESCE(get_my_role(), '')
    WHEN 'president' THEN true
    WHEN 'vice_president' THEN true
    WHEN 'treasurer' THEN true
    WHEN 'branch_president' THEN branch_id = get_my_branch() AND COALESCE(is_wilaya_level, false) = false
    ELSE false
  END
);

-- ── MEMBERS ────────────────────────────────────────────────────────
CREATE POLICY "members_access" ON members FOR SELECT USING (
  CASE COALESCE(get_my_role(), '')
    WHEN 'president' THEN true
    WHEN 'vice_president' THEN true
    WHEN 'treasurer' THEN true
    WHEN 'board_member' THEN true
    WHEN 'branch_president' THEN branch_id = get_my_branch()
    ELSE false
  END
  AND is_deleted = false
);

CREATE POLICY "members_insert" ON members FOR INSERT WITH CHECK (
  COALESCE(get_my_role(), '') IN (
    'president','vice_president','board_member','branch_president'
  )
);

CREATE POLICY "members_update" ON members FOR UPDATE USING (
  CASE COALESCE(get_my_role(), '')
    WHEN 'president' THEN true
    WHEN 'vice_president' THEN true
    WHEN 'board_member' THEN true
    WHEN 'branch_president' THEN branch_id = get_my_branch()
    ELSE false
  END
);

-- ── MAIL REGISTRY ───────────────────────────────────────────────────
CREATE POLICY "mail_access" ON mail_registry FOR SELECT USING (
  CASE COALESCE(get_my_role(), '')
    WHEN 'president' THEN true
    WHEN 'vice_president' THEN true
    WHEN 'treasurer' THEN true
    WHEN 'board_member' THEN true
    WHEN 'branch_president' THEN
      branch_id = get_my_branch()
      AND COALESCE(is_wilaya_level, false) = false
    ELSE false
  END
);

CREATE POLICY "mail_write" ON mail_registry FOR ALL USING (
  is_wilaya_user() OR (
    get_my_role() = 'branch_president'
    AND branch_id = get_my_branch()
    AND COALESCE(is_wilaya_level, false) = false
  )
) WITH CHECK (
  is_wilaya_user() OR (
    get_my_role() = 'branch_president'
    AND branch_id = get_my_branch()
    AND COALESCE(is_wilaya_level, false) = false
  )
);

-- ── MEETINGS ────────────────────────────────────────────────────────
CREATE POLICY "meetings_access" ON meetings FOR SELECT USING (
  CASE COALESCE(get_my_role(), '')
    WHEN 'president' THEN true
    WHEN 'vice_president' THEN true
    WHEN 'treasurer' THEN true
    WHEN 'board_member' THEN true
    WHEN 'branch_president' THEN
      branch_id = get_my_branch()
      AND COALESCE(is_wilaya_level, false) = false
    ELSE false
  END
);

CREATE POLICY "meetings_write" ON meetings FOR ALL USING (is_wilaya_user() OR (
  get_my_role() = 'branch_president' AND branch_id = get_my_branch()
)) WITH CHECK (is_wilaya_user() OR (
  get_my_role() = 'branch_president' AND branch_id = get_my_branch()
));

-- ── INVENTORY ───────────────────────────────────────────────────────
CREATE POLICY "inventory_access" ON inventory FOR SELECT USING (
  CASE COALESCE(get_my_role(), '')
    WHEN 'president' THEN true
    WHEN 'vice_president' THEN true
    WHEN 'treasurer' THEN true
    WHEN 'board_member' THEN true
    WHEN 'branch_president' THEN branch_id = get_my_branch()
    ELSE false
  END
);

CREATE POLICY "inventory_write" ON inventory FOR ALL USING (
  is_wilaya_user() OR (get_my_role() = 'branch_president' AND branch_id = get_my_branch())
) WITH CHECK (
  is_wilaya_user() OR (get_my_role() = 'branch_president' AND branch_id = get_my_branch())
);

CREATE POLICY "inventory_movements_all" ON inventory_movements FOR ALL USING (
  is_wilaya_user() OR get_my_role() = 'branch_president'
) WITH CHECK (
  is_wilaya_user() OR get_my_role() = 'branch_president'
);

-- ── OCCASIONS ───────────────────────────────────────────────────────
CREATE POLICY "occasions_access" ON occasions FOR SELECT USING (
  CASE COALESCE(get_my_role(), '')
    WHEN 'president' THEN true
    WHEN 'vice_president' THEN true
    WHEN 'treasurer' THEN true
    WHEN 'board_member' THEN true
    WHEN 'branch_president' THEN
      (branch_id = get_my_branch() OR COALESCE(is_wilaya_level, false) = true)
    ELSE false
  END
  AND is_deleted = false
);

CREATE POLICY "occasions_write" ON occasions FOR ALL USING (
  is_top_management()
  OR get_my_role() = 'board_member'
  OR (get_my_role() = 'branch_president' AND branch_id = get_my_branch() AND COALESCE(is_wilaya_level, false) = false)
) WITH CHECK (
  is_top_management()
  OR get_my_role() = 'board_member'
  OR (get_my_role() = 'branch_president' AND branch_id = get_my_branch() AND COALESCE(is_wilaya_level, false) = false)
);

-- ── DOCUMENTS ───────────────────────────────────────────────────────
CREATE POLICY "documents_access" ON documents FOR SELECT USING (
  CASE COALESCE(get_my_role(), '')
    WHEN 'president' THEN true
    WHEN 'vice_president' THEN true
    WHEN 'treasurer' THEN true
    WHEN 'board_member' THEN COALESCE(is_confidential, false) = false
    WHEN 'branch_president' THEN
      branch_id = get_my_branch()
      AND COALESCE(is_confidential, false) = false
      AND COALESCE(is_wilaya_level, false) = false
    ELSE false
  END
  AND is_deleted = false
);

CREATE POLICY "documents_write" ON documents FOR ALL USING (
  is_top_management() OR get_my_role() = 'board_member' OR (
    get_my_role() = 'branch_president' AND branch_id = get_my_branch()
  )
) WITH CHECK (
  is_top_management() OR get_my_role() = 'board_member' OR (
    get_my_role() = 'branch_president' AND branch_id = get_my_branch()
  )
);

-- ── SAVED REPORTS ──────────────────────────────────────────────────
CREATE POLICY "reports_access" ON saved_reports FOR SELECT USING (
  CASE COALESCE(get_my_role(), '')
    WHEN 'president' THEN true
    WHEN 'vice_president' THEN true
    WHEN 'treasurer' THEN true
    WHEN 'board_member' THEN report_type = 'literary'
    WHEN 'branch_president' THEN report_type = 'literary' AND branch_id = get_my_branch()
    ELSE false
  END
);

CREATE POLICY "reports_write" ON saved_reports FOR INSERT WITH CHECK (
  is_top_management()
  OR (get_my_role() = 'board_member' AND report_type = 'literary')
);

CREATE POLICY "reports_update" ON saved_reports FOR UPDATE USING (is_top_management());

-- ── USER PROFILES ───────────────────────────────────────────────────
CREATE POLICY "profiles_own" ON user_profiles FOR SELECT USING (
  id = auth.uid()
  OR is_top_management()
  OR (
    COALESCE(get_my_role(), '') = 'board_member'
  )
  OR (
    get_my_role() = 'branch_president'
    AND branch_id IS NOT DISTINCT FROM get_my_branch()
  )
);

CREATE POLICY "profiles_update_self" ON user_profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_insert_self" ON user_profiles FOR INSERT WITH CHECK (id = auth.uid());

-- ── EXTERNAL USERS ──────────────────────────────────────────────────
CREATE POLICY "external_internal_read" ON external_users FOR SELECT USING (
  auth_id = auth.uid()
  OR is_wilaya_user()
  OR get_my_role() = 'branch_president'
);

CREATE POLICY "external_own_update" ON external_users FOR UPDATE USING (auth_id = auth.uid());

CREATE POLICY "external_self_insert" ON external_users FOR INSERT WITH CHECK (auth_id = auth.uid());

-- ── VOLUNTEERS ──────────────────────────────────────────────────────
CREATE POLICY "volunteer_select" ON volunteers FOR SELECT USING (
  external_user_id IN (SELECT id FROM external_users WHERE auth_id = auth.uid())
  OR is_wilaya_user()
);

CREATE POLICY "volunteer_write_internal" ON volunteers FOR ALL USING (is_wilaya_user()) WITH CHECK (is_wilaya_user());

-- ── DONOR PROFILES ──────────────────────────────────────────────────
CREATE POLICY "donor_own" ON donor_profiles FOR SELECT USING (
  external_user_id IN (SELECT id FROM external_users WHERE auth_id = auth.uid())
  OR is_top_management()
);

CREATE POLICY "donor_write_internal" ON donor_profiles FOR ALL USING (is_top_management()) WITH CHECK (is_top_management());

-- ── BENEFICIARY PORTAL ────────────────────────────────────────────────
CREATE POLICY "beneficiary_own" ON beneficiary_portal FOR SELECT USING (
  external_user_id IN (SELECT id FROM external_users WHERE auth_id = auth.uid())
  OR is_wilaya_user()
);

CREATE POLICY "beneficiary_write_internal" ON beneficiary_portal FOR ALL USING (is_wilaya_user()) WITH CHECK (is_wilaya_user());

-- ── PORTAL REQUESTS ─────────────────────────────────────────────────
CREATE POLICY "requests_select" ON portal_requests FOR SELECT USING (
  requester_id IN (SELECT id FROM external_users WHERE auth_id = auth.uid())
  OR is_wilaya_user()
  OR get_my_role() = 'branch_president'
);

CREATE POLICY "requests_insert_external" ON portal_requests FOR INSERT WITH CHECK (
  requester_id IN (SELECT id FROM external_users WHERE auth_id = auth.uid())
);

CREATE POLICY "requests_write_internal" ON portal_requests FOR UPDATE USING (
  is_wilaya_user() OR get_my_role() = 'branch_president'
);

-- ── HONOR WALL ───────────────────────────────────────────────────────
CREATE POLICY "honor_public" ON honor_wall FOR SELECT USING (visible_on_landing = true);
CREATE POLICY "honor_internal_write" ON honor_wall FOR ALL USING (is_wilaya_user()) WITH CHECK (is_wilaya_user());

-- ── NOTIFICATIONS ───────────────────────────────────────────────────
CREATE POLICY "notif_own" ON notifications FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "notif_update_own" ON notifications FOR UPDATE USING (recipient_id = auth.uid());
CREATE POLICY "notif_insert_internal" ON notifications FOR INSERT WITH CHECK (is_wilaya_user());

-- ── FAMILY BENEFITS ─────────────────────────────────────────────────
CREATE POLICY "benefits_access" ON family_benefits FOR SELECT USING (
  CASE COALESCE(get_my_role(), '')
    WHEN 'president' THEN true
    WHEN 'vice_president' THEN true
    WHEN 'treasurer' THEN true
    WHEN 'board_member' THEN true
    WHEN 'branch_president' THEN branch_id = get_my_branch()
    ELSE false
  END
);

CREATE POLICY "benefits_write" ON family_benefits FOR ALL USING (
  is_wilaya_user() OR (get_my_role() = 'branch_president' AND branch_id = get_my_branch())
) WITH CHECK (
  is_wilaya_user() OR (get_my_role() = 'branch_president' AND branch_id = get_my_branch())
);

-- ── DONORS (internal CRM) ───────────────────────────────────────────
CREATE POLICY "donors_select" ON donors FOR SELECT USING (
  (is_top_management() OR get_my_role() = 'board_member')
  AND is_deleted = false
);

CREATE POLICY "donors_write" ON donors FOR ALL USING (
  is_top_management() OR get_my_role() = 'board_member'
) WITH CHECK (
  is_top_management() OR get_my_role() = 'board_member'
);

-- ── AUDIT LOGS ───────────────────────────────────────────────────────
CREATE POLICY "audit_insert" ON audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "audit_select" ON audit_logs FOR SELECT USING (is_top_management());

-- ── REPORT REMINDERS ─────────────────────────────────────────────────
CREATE POLICY "report_reminders_select" ON report_reminders FOR SELECT USING (is_wilaya_user());
CREATE POLICY "report_reminders_write" ON report_reminders FOR ALL USING (is_top_management()) WITH CHECK (is_top_management());

-- ── VOLUNTEER LOGS ───────────────────────────────────────────────────
CREATE POLICY "volunteer_logs_select" ON volunteer_logs FOR SELECT USING (
  volunteer_id IN (SELECT id FROM volunteers v JOIN external_users e ON e.id = v.external_user_id WHERE e.auth_id = auth.uid())
  OR is_wilaya_user()
);
CREATE POLICY "volunteer_logs_write" ON volunteer_logs FOR ALL USING (is_wilaya_user()) WITH CHECK (is_wilaya_user());
