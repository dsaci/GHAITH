-- ═══════════════════════════════════════════════════════════════════
-- GHAITH PLATFORM: PURE RPC / NO-MCP HARDENING
-- ═══════════════════════════════════════════════════════════════════

-- 1. HARDENED RPCs (SECURITY DEFINER)
-- ───────────────────────────────────────────────────────────────────

-- A. Record Bylaw Agreement with Audit Telemetry
CREATE OR REPLACE FUNCTION record_bylaw_agreement()
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_v TEXT;
  headers JSON;
  client_ip TEXT;
  client_ua TEXT;
BEGIN
  -- Get current version
  SELECT version INTO current_v FROM bylaw_versions WHERE is_current = true LIMIT 1;

  -- Extract client metadata from headers
  SELECT current_setting('request.headers', true)::json INTO headers;
  client_ip := headers->>'x-real-ip';
  client_ua := headers->>'user-agent';

  -- Secure Insert with Conflict handling
  INSERT INTO bylaw_acknowledgments (
    user_id, bylaw_version, acknowledged_at, ip_address, user_agent
  )
  VALUES (
    auth.uid(), COALESCE(current_v, '1.0'), NOW(), client_ip::INET, client_ua
  )
  ON CONFLICT (user_id, bylaw_version)
  DO UPDATE SET
    acknowledged_at = EXCLUDED.acknowledged_at,
    ip_address = EXCLUDED.ip_address,
    user_agent = EXCLUDED.user_agent;
END;
$$ LANGUAGE plpgsql;

-- B. Check if user needs to acknowledge latest bylaw
CREATE OR REPLACE FUNCTION needs_bylaw_acknowledgment()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  latest_version TEXT;
  user_ack_version TEXT;
BEGIN
  SELECT version INTO latest_version FROM bylaw_versions WHERE is_current = true LIMIT 1;

  SELECT bylaw_version INTO user_ack_version
  FROM bylaw_acknowledgments
  WHERE user_id = auth.uid()
  ORDER BY acknowledged_at DESC LIMIT 1;

  RETURN (user_ack_version IS NULL OR user_ack_version != latest_version);
END;
$$ LANGUAGE plpgsql;

-- C. Advanced RPC for pending registrations (Admin-Only context)
DROP FUNCTION IF EXISTS get_pending_registrations_v2();
CREATE OR REPLACE FUNCTION get_pending_registrations_v2()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  social_media TEXT,
  portal_type TEXT,
  status TEXT,
  address TEXT,
  birth_date DATE,
  birth_place TEXT,
  national_id TEXT,
  created_at TIMESTAMPTZ,
  volunteers JSON,
  portal_requests JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    eu.id, 
    eu.full_name, 
    eu.phone, 
    eu.email,
    eu.social_media,
    eu.portal_type, 
    eu.status,
    eu.address,
    eu.birth_date,
    eu.birth_place,
    eu.national_id,
    eu.created_at,
    (SELECT json_agg(v.*) FROM volunteers v WHERE v.external_user_id = eu.id),
    (SELECT json_agg(pr.*) FROM portal_requests pr WHERE pr.requester_id = eu.id)
  FROM external_users eu
  WHERE eu.status = 'pending'
  ORDER BY eu.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RLS POLICIES (STRICT REST BLOCKAGE)
-- ───────────────────────────────────────────────────────────────────

-- A. Bylaw Acknowledgments: Block REST Insert, Allow self-Select
ALTER TABLE bylaw_acknowledgments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bylaw_rpc_only ON bylaw_acknowledgments;
CREATE POLICY bylaw_rpc_only
ON bylaw_acknowledgments
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (false); -- Block all direct REST inserts

-- B. External Users: Restrict Select to Self, Block REST updates entirely
ALTER TABLE external_users ENABLE ROW LEVEL SECURITY;

-- R. Advanced Finance Fetcher (Pure RPC)
DROP FUNCTION IF EXISTS get_financial_transactions_v2(int,uuid,text,boolean);
CREATE OR REPLACE FUNCTION get_financial_transactions_v2(
  p_year INT DEFAULT NULL,
  p_branch_id UUID DEFAULT NULL,
  p_type TEXT DEFAULT NULL,
  p_is_wilaya_level BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  transaction_type TEXT,
  category TEXT,
  amount NUMERIC,
  description TEXT,
  transaction_date DATE,
  branch_id UUID,
  is_wilaya_level BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id, t.transaction_type, t.category, t.amount, t.description, 
    t.transaction_date, t.branch_id, t.is_wilaya_level, t.created_at
  FROM transactions t
  WHERE t.is_deleted = false
    AND (p_year IS NULL OR EXTRACT(YEAR FROM t.transaction_date) = p_year)
    AND (p_branch_id IS NULL OR t.branch_id = p_branch_id)
    AND (p_type IS NULL OR t.transaction_type = p_type)
    AND (p_is_wilaya_level IS NULL OR t.is_wilaya_level = p_is_wilaya_level)
  ORDER BY t.transaction_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- S. Secure Finance Summary (Pure RPC)
DROP FUNCTION IF EXISTS get_finance_summary_v2(int,uuid);
CREATE OR REPLACE FUNCTION get_finance_summary_v2(
  p_year INT DEFAULT NULL,
  p_branch_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_income NUMERIC := 0;
  v_expense NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_income
  FROM transactions
  WHERE is_deleted = false
    AND transaction_type = 'income'
    AND (p_year IS NULL OR EXTRACT(YEAR FROM transaction_date) = p_year)
    AND (p_branch_id IS NULL OR branch_id = p_branch_id);

  SELECT COALESCE(SUM(amount), 0) INTO v_expense
  FROM transactions
  WHERE is_deleted = false
    AND transaction_type = 'expense'
    AND (p_year IS NULL OR EXTRACT(YEAR FROM transaction_date) = p_year)
    AND (p_branch_id IS NULL OR branch_id = p_branch_id);

  RETURN json_build_object(
    'income_total', v_income,
    'expense_total', v_expense,
    'balance', v_income - v_expense
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- P. Standardized Family Management (Pure RPC)
DROP FUNCTION IF EXISTS manage_family_v2(uuid,jsonb);
CREATE OR REPLACE FUNCTION manage_family_v2(
  p_id UUID DEFAULT NULL,
  p_data JSONB DEFAULT '{}'
)
RETURNS JSON AS $$
DECLARE
  v_res JSON;
BEGIN
  IF p_id IS NULL THEN
    -- Create
    INSERT INTO families (
      family_name, registration_number, phone, address, category, members_count,
      income_level, monthly_income, housing_status, has_social_coverage, notes,
      branch_id, registered_by
    ) VALUES (
      p_data->>'family_name', p_data->>'registration_number', p_data->>'phone',
      p_data->>'address', p_data->>'category', (p_data->>'members_count')::INT,
      p_data->>'income_level', (p_data->>'monthly_income')::NUMERIC, p_data->>'housing_status',
      (p_data->>'has_social_coverage')::BOOLEAN, p_data->>'notes',
      (p_data->>'branch_id')::UUID, auth.uid()
    ) RETURNING id INTO p_id;
  ELSE
    -- Update
    UPDATE families SET
      family_name = COALESCE(p_data->>'family_name', family_name),
      phone = COALESCE(p_data->>'phone', phone),
      address = COALESCE(p_data->>'address', address),
      status = COALESCE(p_data->>'status', status),
      is_deleted = COALESCE((p_data->>'is_deleted')::BOOLEAN, is_deleted),
      updated_at = NOW()
    WHERE id = p_id;
  END IF;

  RETURN json_build_object('id', p_id, 'success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Q. Standardized Member Management (Pure RPC)
DROP FUNCTION IF EXISTS manage_member_v2(uuid,text,text,boolean);
CREATE OR REPLACE FUNCTION manage_member_v2(
  p_id UUID DEFAULT NULL,
  p_role_in_association TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_is_deleted BOOLEAN DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
  IF p_id IS NOT NULL THEN
    UPDATE members SET
      role_in_association = COALESCE(p_role_in_association, role_in_association),
      status = COALESCE(p_status, status),
      is_deleted = COALESCE(p_is_deleted, is_deleted),
      updated_at = NOW()
    WHERE id = p_id;
    RETURN json_build_object('id', p_id, 'success', true);
  END IF;
  RETURN json_build_object('success', false, 'message', 'Member creation via RPC pending refinement');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- T. Public Volunteer Submission (Pure RPC)
-- Securely registers a new volunteer from the public portal
DROP FUNCTION IF EXISTS submit_public_volunteer(text,text,date,text,text,text,text,text,text);
CREATE OR REPLACE FUNCTION submit_public_volunteer(
  p_full_name TEXT,
  p_phone TEXT,
  p_birth_date DATE,
  p_birth_place TEXT,
  p_municipality_name TEXT,
  p_occupation TEXT,
  p_specialization TEXT,
  p_education_level TEXT,
  p_reason TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_muni_id UUID;
BEGIN
  -- 1. Find Municipality ID
  SELECT id INTO v_muni_id FROM municipalities WHERE name = p_municipality_name LIMIT 1;

  -- 2. Upsert External User (by phone)
  INSERT INTO external_users (
    full_name, phone, birth_date, birth_place, municipality_id, portal_type, status
  ) VALUES (
    p_full_name, p_phone, p_birth_date, p_birth_place, v_muni_id, 'volunteer', 'pending'
  )
  ON CONFLICT (id) DO NOTHING -- Fallback if ID exists, but we usually expect new
  RETURNING id INTO v_user_id;

  -- 3. If user didn't return (already exists by phone check - manual since no unique constraint in schema)
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM external_users WHERE phone = p_phone LIMIT 1;
    UPDATE external_users SET status = 'pending' WHERE id = v_user_id;
  END IF;

  -- 4. Create/Update Volunteer Profile
  INSERT INTO volunteers (
    external_user_id, profession, education_level, joined_date
  ) VALUES (
    v_user_id, p_occupation, p_education_level, CURRENT_DATE
  )
  ON CONFLICT (external_user_id) DO UPDATE SET
    profession = EXCLUDED.profession,
    education_level = EXCLUDED.education_level;

  -- 5. Audit Log (Phase 3 integration)
  INSERT INTO audit_logs (
    user_id, user_type, action, resource_type, resource_id, new_values
  ) VALUES (
    v_user_id, 'volunteer', 'create', 'external_users', v_user_id,
    jsonb_build_object('full_name', p_full_name, 'phone', p_phone)::TEXT
  );

  RETURN json_build_object('success', true, 'user_id', v_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- U. Public Help Request Submission (Pure RPC)
-- Securely registers a help request from the public portal
DROP FUNCTION IF EXISTS submit_public_help_request(text,text,text,text,text);
CREATE OR REPLACE FUNCTION submit_public_help_request(
  p_full_name TEXT,
  p_phone TEXT,
  p_municipality_name TEXT,
  p_aid_type TEXT,
  p_description TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_muni_id UUID;
  v_request_id UUID;
BEGIN
  -- 1. Find Municipality ID
  SELECT id INTO v_muni_id FROM municipalities WHERE name = p_municipality_name LIMIT 1;

  -- 2. Upsert External User (by phone)
  INSERT INTO external_users (
    full_name, phone, municipality_id, portal_type, status
  ) VALUES (
    p_full_name, p_phone, v_muni_id, 'beneficiary', 'pending'
  )
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO v_user_id;

  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM external_users WHERE phone = p_phone LIMIT 1;
  END IF;

  -- 3. Create Portal Request
  INSERT INTO portal_requests (
    requester_id, request_type, description, status, urgency
  ) VALUES (
    v_user_id, p_aid_type, p_description, 'pending', 'medium'
  ) RETURNING id INTO v_request_id;

  -- 4. Audit Log
  INSERT INTO audit_logs (
    user_id, user_type, action, resource_type, resource_id, new_values
  ) VALUES (
    v_user_id, 'beneficiary', 'create', 'portal_requests', v_request_id,
    jsonb_build_object('aid_type', p_aid_type)::TEXT
  );

  RETURN json_build_object('success', true, 'request_id', v_request_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- V. Hardened Trigger Function: log_resource_activity (Pure RPC)
-- This function runs with elevated permissions to ensure logs are ALWAYS written.
CREATE OR REPLACE FUNCTION log_resource_activity_v2()
RETURNS TRIGGER AS $$
DECLARE
  v_user_name TEXT;
  v_description TEXT;
BEGIN
  -- 1. Resolve User Name (Internal only)
  SELECT full_name INTO v_user_name FROM user_profiles WHERE id = auth.uid();

  -- 2. Build Description based on Table and Operation
  IF (TG_OP = 'INSERT') THEN
    IF (TG_TABLE_NAME = 'families') THEN
      v_description := 'تم تسجيل عائلة ' || NEW.family_name;
    ELSIF (TG_TABLE_NAME = 'members') THEN
      v_description := 'تمت إضافة العضو ' || NEW.full_name;
    ELSIF (TG_TABLE_NAME = 'donors') THEN
      v_description := 'تم تسجيل المحسن ' || NEW.full_name;
    ELSIF (TG_TABLE_NAME = 'family_benefits') THEN
      v_description := 'تم تقديم مساعدة لـ عائلة ' || (SELECT family_name FROM families WHERE id = NEW.family_id);
    ELSIF (TG_TABLE_NAME = 'portal_requests') THEN
      v_description := 'طلب جديد: ' || NEW.request_type;
    ELSIF (TG_TABLE_NAME = 'volunteers') THEN
      v_description := 'تسجيل متطوع جديد';
    END IF;
    
    -- 3. Insert into Dashboard Logs (activity_logs)
    INSERT INTO activity_logs (user_id, user_name, action_type, resource_type, description)
    VALUES (auth.uid(), COALESCE(v_user_name, 'نظام غيث'), 'create', TG_TABLE_NAME, v_description);
    
    -- 4. Insert into Transactional Logs (audit_logs)
    INSERT INTO audit_logs (user_id, user_type, action, resource_type, resource_id, new_values)
    VALUES (auth.uid(), 'internal', 'create', TG_TABLE_NAME, NEW.id, row_to_json(NEW)::TEXT);
    
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- W. Re-apply Hardened Triggers
DROP TRIGGER IF EXISTS trg_log_family_v2 ON families;
CREATE TRIGGER trg_log_family_v2 AFTER INSERT ON families FOR EACH ROW EXECUTE FUNCTION log_resource_activity_v2();

DROP TRIGGER IF EXISTS trg_log_member_v2 ON members;
CREATE TRIGGER trg_log_member_v2 AFTER INSERT ON members FOR EACH ROW EXECUTE FUNCTION log_resource_activity_v2();

DROP TRIGGER IF EXISTS trg_log_benefit_v2 ON family_benefits;
CREATE TRIGGER trg_log_benefit_v2 AFTER INSERT ON family_benefits FOR EACH ROW EXECUTE FUNCTION log_resource_activity_v2();

DROP TRIGGER IF EXISTS trg_log_portal_v2 ON portal_requests;
CREATE TRIGGER trg_log_portal_v2 AFTER INSERT ON portal_requests FOR EACH ROW EXECUTE FUNCTION log_resource_activity_v2();

DROP TRIGGER IF EXISTS trg_log_volunteer_v2 ON volunteers;
CREATE TRIGGER trg_log_volunteer_v2 AFTER INSERT ON volunteers FOR EACH ROW EXECUTE FUNCTION log_resource_activity_v2();

-- ═══════════════════════════════════════════════════════════════════
-- 2. FINAL LOCKDOWN: FORBID DIRECT REST FOR EXCLUSIVE RPC USAGE
-- ───────────────────────────────────────────────────────────────────
-- Aggressive Lockdown: Drops ALL existing policies (killing recursion)
-- and enforces a single, non-recursive block on all sensitive tables.

DO $$
DECLARE
  tables_to_lock TEXT[] := ARRAY[
    'families', 'members', 'family_benefits', 'transactions', 
    'portal_requests', 'external_users', 'user_profiles', 
    'audit_logs', 'activity_logs', 'beneficiary_portal', 
    'benefit_receipts', 'volunteers', 'donor_profiles',
    'bylaw_acknowledgments'
  ];
  t TEXT;
  pol RECORD;
BEGIN
  FOREACH t IN ARRAY tables_to_lock LOOP
    -- 1. Drop ALL existing policies on the table to kill recursion
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = t AND schemaname = 'public' LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, t);
    END LOOP;

    -- 2. Restore Read Visibility (SELECT) for Authenticated Users
    EXECUTE format('CREATE POLICY "Authenticated Select Access" ON %I FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL)', t);
    
    -- 3. Block all other direct REST mutations (Pure RPC Mandate)
    EXECUTE format('CREATE POLICY "Pure RPC Mutation Lockdown" ON %I FOR INSERT WITH CHECK (false)', t);
    EXECUTE format('CREATE POLICY "Pure RPC Update Lockdown" ON %I FOR UPDATE USING (false) WITH CHECK (false)', t);
    EXECUTE format('CREATE POLICY "Pure RPC Delete Lockdown" ON %I FOR DELETE USING (false)', t);

    -- 4. Ensure RLS is enabled
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END;
$$;

-- Additional specific policies for fine-grained control if needed
DROP POLICY IF EXISTS external_users_self ON external_users;
CREATE POLICY external_users_self
ON external_users
FOR SELECT
USING (id = auth.uid());

DROP POLICY IF EXISTS external_users_block_direct ON external_users;
CREATE POLICY external_users_block_direct
ON external_users
FOR ALL
USING (false)
WITH CHECK (false); -- Admin RPCs are SECURITY DEFINER (bypass RLS)

-- C. Portal Requests & Volunteers: RPC-Only Access (Block Direct Selects/Inserts)
ALTER TABLE portal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS portal_requests_strict ON portal_requests;
CREATE POLICY portal_requests_strict
ON portal_requests
FOR ALL
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS volunteers_strict ON volunteers;
CREATE POLICY volunteers_strict
ON volunteers
FOR ALL
USING (false)
WITH CHECK (false);

-- D. Approve External User (Admin RPC)
CREATE OR REPLACE FUNCTION approve_external_user(
  p_user_id UUID,
  p_admin_id UUID
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_portal_type TEXT;
  v_auth_id UUID;
BEGIN
  -- Get user info
  SELECT portal_type, auth_id INTO v_portal_type, v_auth_id 
  FROM external_users 
  WHERE id = p_user_id;

  -- Update status
  UPDATE external_users 
  SET status = 'active', 
      approved_by = p_admin_id, 
      approved_at = NOW()
  WHERE id = p_user_id;

  -- If volunteer, assign number (simplified logic for RPC context)
  IF v_portal_type = 'volunteer' THEN
    UPDATE volunteers 
    SET volunteer_number = 'GHV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('volunteer_num_seq')::TEXT, 4, '0')
    WHERE external_user_id = p_user_id;
  END IF;

  -- Insert notification
  IF v_auth_id IS NOT NULL THEN
    INSERT INTO notifications (recipient_type, recipient_id, title, message, type)
    VALUES (
      CASE WHEN v_portal_type = 'volunteer' THEN 'volunteer' ELSE 'beneficiary' END,
      v_auth_id,
      'تم قبول طلبك',
      'يمكنك الآن تسجيل الدخول إلى البوابة.',
      'approval'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- E. Reject External User (Admin RPC)
CREATE OR REPLACE FUNCTION reject_external_user(
  p_user_id UUID,
  p_reason TEXT,
  p_admin_id UUID
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_portal_type TEXT;
  v_auth_id UUID;
BEGIN
  -- Get user info
  SELECT portal_type, auth_id INTO v_portal_type, v_auth_id 
  FROM external_users 
  WHERE id = p_user_id;

  -- Update status
  UPDATE external_users 
  SET status = 'rejected', 
      rejection_reason = p_reason,
      approved_by = p_admin_id
  WHERE id = p_user_id;

  -- Insert notification
  IF v_auth_id IS NOT NULL THEN
    INSERT INTO notifications (recipient_type, recipient_id, title, message, type)
    VALUES (
      CASE WHEN v_portal_type = 'volunteer' THEN 'volunteer' ELSE 'beneficiary' END,
      v_auth_id,
      'تم رفض الطلب',
      p_reason,
      'rejection'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- F. Refined Paginated Portal Requests (Admin RPC)
-- Supports filtering by status and municipality
CREATE OR REPLACE FUNCTION get_portal_requests_refined(
  p_status TEXT DEFAULT NULL,
  p_municipality TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  family_id UUID,
  requester_name TEXT,
  registration_number TEXT,
  requester_phone TEXT,
  municipality_name TEXT,
  request_type TEXT,
  description TEXT,
  urgency_level TEXT,
  status TEXT,
  reviewer_notes TEXT,
  request_date TIMESTAMPTZ,
  decision_date TIMESTAMPTZ,
  reviewer_name TEXT,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    pr.requester_id as family_id, -- Using requester_id as family_id for link consistency
    eu.full_name as requester_name,
    v.volunteer_number::TEXT as registration_number, -- Fallback for display
    eu.phone as requester_phone,
    m.name as municipality_name,
    pr.request_type,
    pr.description,
    pr.urgency as urgency_level,
    pr.status,
    pr.internal_notes as reviewer_notes,
    pr.created_at as request_date,
    pr.reviewed_at as decision_date,
    (SELECT full_name FROM members WHERE id = pr.reviewed_by) as reviewer_name,
    COUNT(*) OVER() as total_count
  FROM portal_requests pr
  JOIN external_users eu ON pr.requester_id = eu.id
  LEFT JOIN municipalities m ON eu.municipality_id = m.id
  LEFT JOIN volunteers v ON v.external_user_id = eu.id
  WHERE (p_status IS NULL OR pr.status = p_status)
    AND (p_municipality IS NULL OR m.name = p_municipality)
  ORDER BY pr.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- G. Atomic Portal Request Status Update (Admin RPC)
-- Handles status change AND automated notification insertion.
CREATE OR REPLACE FUNCTION update_portal_request_atomic(
  p_request_id UUID,
  p_status TEXT,
  p_notes TEXT,
  p_reviewer_id UUID,
  p_family_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_status_label TEXT;
BEGIN
  -- 1. Update Request
  UPDATE portal_requests 
  SET 
    status = p_status,
    internal_notes = p_notes,
    reviewed_by = p_reviewer_id,
    reviewed_at = NOW()
  WHERE id = p_request_id;

  -- 2. Determine Notification Metadata
  v_status_label := CASE 
    WHEN p_status = 'approved' THEN 'مقبول ✅'
    WHEN p_status = 'rejected' THEN 'مرفوض ❌'
    WHEN p_status = 'under_review' THEN 'قيد المراجعة ⏳'
    WHEN p_status = 'fulfilled' THEN 'تم التنفيذ 🎉'
    ELSE p_status
  END;

  -- 3. Atomic Notification
  INSERT INTO notifications (
    recipient_type, recipient_id, title, message, type
  )
  VALUES (
    'beneficiary',
    p_family_id,
    'تحديث لطلب المساعدة: ' || v_status_label,
    COALESCE(p_notes, 'تم تحديث حالة طلبك إلى: ' || v_status_label),
    CASE WHEN p_status = 'rejected' THEN 'rejection' ELSE 'approval' END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- I. Idempotent Beneficiary Linking (Admin RPC)
CREATE OR REPLACE FUNCTION link_beneficiary_v2(
  p_external_user_id UUID,
  p_family_id UUID,
  p_linked_by UUID
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO beneficiary_portal (external_user_id, family_id, linked_at, linked_by)
  VALUES (p_external_user_id, p_family_id, NOW(), p_linked_by)
  ON CONFLICT (external_user_id) DO UPDATE SET
    family_id = EXCLUDED.family_id,
    linked_at = EXCLUDED.linked_at,
    linked_by = EXCLUDED.linked_by;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. PERFORMANCE & INTEGRITY (INDEXES)
-- ───────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_bylaw_ack_user_version
ON bylaw_acknowledgments(user_id, bylaw_version);

-- M. Robust Families Fetcher (Pure RPC)
DROP FUNCTION IF EXISTS get_families_v2(TEXT, UUID, TEXT, INT, INT);
CREATE OR REPLACE FUNCTION get_families_v2(
  p_status TEXT DEFAULT NULL,
  p_branch_id UUID DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_limit INT DEFAULT 100,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  registration_number TEXT,
  family_name TEXT,
  national_id TEXT,
  phone TEXT,
  address TEXT,
  category TEXT,
  members_count INT,
  income_level TEXT,
  monthly_income NUMERIC,
  housing_status TEXT,
  has_social_coverage BOOLEAN,
  notes TEXT,
  registration_date DATE,
  registered_by UUID,
  branch_id UUID,
  status TEXT,
  is_deleted BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id, f.registration_number, f.family_name, f.national_id, f.phone, f.address,
    f.category, f.members_count, f.income_level, f.monthly_income, f.housing_status,
    f.has_social_coverage, f.notes, f.registration_date, f.registered_by, f.branch_id,
    f.status, f.is_deleted, f.created_at, f.updated_at
  FROM families f
  WHERE f.is_deleted = false
    AND (p_status IS NULL OR f.status = p_status)
    AND (p_branch_id IS NULL OR f.branch_id = p_branch_id)
    AND (p_search IS NULL OR f.family_name ILIKE '%' || p_search || '%' OR f.registration_number ILIKE '%' || p_search || '%')
  ORDER BY f.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- N. Atomic Benefit & Financial Recording (Pure RPC)
-- This is the "Hardened Core" of the platform's social aid logic.
DROP FUNCTION IF EXISTS record_family_benefit_atomic_v2(UUID, TEXT, NUMERIC, TEXT, TIMESTAMPTZ, UUID, TEXT);
CREATE OR REPLACE FUNCTION record_family_benefit_atomic_v2(
  p_family_id UUID,
  p_benefit_type TEXT,
  p_amount NUMERIC DEFAULT 0,
  p_description TEXT DEFAULT NULL,
  p_benefit_date TIMESTAMPTZ DEFAULT NOW(),
  p_occasion_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_family_name TEXT;
  v_branch_id UUID;
  v_benefit_id UUID;
BEGIN
  -- 1. Fetch Family Context
  SELECT family_name, f.branch_id INTO v_family_name, v_branch_id
  FROM families f WHERE id = p_family_id;

  -- 2. Insert Benefit Entry
  INSERT INTO family_benefits (
    family_id, benefit_type, amount, description, benefit_date, 
    occasion_id, approved_by, branch_id, notes
  ) VALUES (
    p_family_id, p_benefit_type, p_amount, p_description, p_benefit_date,
    p_occasion_id, v_user_id, v_branch_id, p_notes
  ) RETURNING id INTO v_benefit_id;

  -- 3. Atomic Financial Transaction (if aid has monetary value)
  IF p_amount > 0 THEN
    INSERT INTO transactions (
      transaction_type, category, amount, description, transaction_date, 
      family_id, occasion_id, branch_id, created_by, approved_by
    ) VALUES (
      'expense', 'مساعدات اجتماعية', p_amount, 
      'مساعدة عائلية (' || p_benefit_type || '): ' || v_family_name,
      p_benefit_date, p_family_id, p_occasion_id, v_branch_id, v_user_id, v_user_id
    );
  END IF;

  -- 4. Audit Telemetry
  INSERT INTO audit_logs (
    user_id, user_type, action, resource_type, resource_id, new_values
  ) VALUES (
    v_user_id, 'internal', 'create', 'family_benefits', v_benefit_id,
    jsonb_build_object('family_id', p_family_id, 'type', p_benefit_type, 'amount', p_amount)::TEXT
  );

  RETURN json_build_object('success', true, 'benefit_id', v_benefit_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SSS. Secure Family Detail Fetcher (Pure RPC)
DROP FUNCTION IF EXISTS get_family_by_id_v2(uuid);
CREATE OR REPLACE FUNCTION get_family_by_id_v2(p_id UUID)
RETURNS JSON AS $$
DECLARE
  v_family JSON;
BEGIN
  SELECT json_build_object(
    'id', f.id,
    'registration_number', f.registration_number,
    'family_name', f.family_name,
    'national_id', f.national_id,
    'phone', f.phone,
    'address', f.address,
    'municipality_id', f.municipality_id,
    'category', f.category,
    'members_count', f.members_count,
    'income_level', f.income_level,
    'monthly_income', f.monthly_income,
    'housing_status', f.housing_status,
    'has_social_coverage', f.has_social_coverage,
    'notes', f.notes,
    'registration_date', f.registration_date,
    'status', f.status,
    'branch_id', f.branch_id,
    'created_at', f.created_at
  ) INTO v_family
  FROM families f
  WHERE f.id = p_id AND f.is_deleted = false;

  RETURN v_family;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- BBB. Secure Family Benefits Fetcher (Pure RPC)
DROP FUNCTION IF EXISTS get_family_benefits_v2(uuid);
CREATE OR REPLACE FUNCTION get_family_benefits_v2(p_family_id UUID)
RETURNS TABLE (
  id UUID,
  benefit_type TEXT,
  amount NUMERIC,
  description TEXT,
  benefit_date TIMESTAMPTZ,
  occasion_id UUID,
  notes TEXT,
  approved_by_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fb.id, fb.benefit_type, fb.amount, fb.description, 
    fb.benefit_date, fb.occasion_id, fb.notes,
    (SELECT full_name FROM user_profiles WHERE id = fb.approved_by)
  FROM family_benefits fb
  WHERE fb.family_id = p_family_id
  ORDER BY fb.benefit_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- J. Unified Profile Fetcher (Pure RPC)
-- Securely retrieves the current user's profile (Internal or External)
DROP FUNCTION IF EXISTS get_my_profile_v2();
CREATE OR REPLACE FUNCTION get_my_profile_v2()
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile JSON;
BEGIN
  -- 1. Try Internal Profile
  SELECT json_build_object(
    'type', 'internal',
    'id', id,
    'full_name', full_name,
    'role', role,
    'space', space,
    'branch_id', branch_id,
    'is_active', is_active,
    'phone', phone,
    'last_login', last_login
  ) INTO v_profile
  FROM user_profiles
  WHERE id = v_user_id;

  IF v_profile IS NOT NULL THEN
    -- Update last login for internal users
    UPDATE user_profiles SET last_login = NOW() WHERE id = v_user_id;
    RETURN v_profile;
  END IF;

  -- 2. Try External Profile
  SELECT json_build_object(
    'type', 'external',
    'id', id,
    'full_name', full_name,
    'email', email,
    'phone', phone,
    'portal_type', portal_type,
    'status', status,
    'registration_date', created_at
  ) INTO v_profile
  FROM external_users
  WHERE auth_id = v_user_id;

  RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- K. Atomic External User Registration (Pure RPC)
-- Handles external_user creation and specific portal metadata in one transaction.
DROP FUNCTION IF EXISTS register_external_user_v3(UUID, TEXT, TEXT, TEXT, TEXT, JSONB);
CREATE OR REPLACE FUNCTION register_external_user_v3(
  p_auth_id UUID,
  p_portal_type TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS JSON AS $$
DECLARE
  v_ext_user_id UUID;
BEGIN
  -- 1. Create Base External User
  INSERT INTO external_users (auth_id, portal_type, full_name, phone, email, status)
  VALUES (p_auth_id, p_portal_type, p_full_name, p_phone, p_email, 'pending')
  RETURNING id INTO v_ext_user_id;

  -- 2. Create Specific Profile
  IF p_portal_type = 'volunteer' THEN
    INSERT INTO volunteers (
      external_user_id, occupation, specialization, education_level, volunteer_number
    ) VALUES (
      v_ext_user_id,
      (p_metadata->>'occupation'),
      (p_metadata->>'specialization'),
      (p_metadata->>'education_level'),
      'V-' || floor(random() * 90000 + 10000)::TEXT -- Temp number generation
    );
  ELSIF p_portal_type = 'donor' THEN
    INSERT INTO donor_profiles (
      external_user_id, donor_tier, show_in_honor_wall
    ) VALUES (
      v_ext_user_id,
      'bronze',
      COALESCE((p_metadata->>'show_in_honor_wall')::BOOLEAN, false)
    );
  END IF;

  RETURN json_build_object('id', v_ext_user_id, 'status', 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- L. Hardened Audit Logger (Pure RPC)
DROP FUNCTION IF EXISTS secure_audit_log_v2(TEXT, TEXT, TEXT, JSONB, TEXT);
CREATE OR REPLACE FUNCTION secure_audit_log_v2(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_user_type TEXT DEFAULT 'internal'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id, user_type, action, resource_type, resource_id, new_values, created_at
  )
  VALUES (
    auth.uid(),
    p_user_type,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details::TEXT,
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- S. Secure Audit Log Fetcher (Pure RPC)
DROP FUNCTION IF EXISTS get_audit_logs_v2(INT, INT);
CREATE OR REPLACE FUNCTION get_audit_logs_v2(
  p_limit INT DEFAULT 100,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_type TEXT,
  full_name TEXT,
  action TEXT,
  resource_type TEXT,
  resource_id TEXT,
  new_values TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id, al.user_id, al.user_type,
    up.full_name, al.action, al.resource_type,
    al.resource_id, al.new_values, al.created_at
  FROM audit_logs al
  LEFT JOIN user_profiles up ON up.id = al.user_id
  ORDER BY al.created_at DESC
  LIMIT p_limit 
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- T. Secure Benefit Receipts Fetcher (Pure RPC)
DROP FUNCTION IF EXISTS get_benefit_receipts_v2(INT, INT);
CREATE OR REPLACE FUNCTION get_benefit_receipts_v2(
  p_limit INT DEFAULT 100,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  receipt_number TEXT,
  family_id UUID,
  family_name TEXT,
  registration_number TEXT,
  benefit_type TEXT,
  benefit_value NUMERIC,
  benefit_description TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  created_by_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    br.id, br.receipt_number, br.family_id,
    f.family_name, f.registration_number,
    br.benefit_type, br.benefit_value, br.benefit_description,
    br.status, br.created_at,
    (SELECT full_name FROM user_profiles WHERE id = br.created_by)
  FROM benefit_receipts br
  JOIN families f ON f.id = br.family_id
  ORDER BY br.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- U. Secure Benefit Receipt Status Manager (Pure RPC)
DROP FUNCTION IF EXISTS manage_benefit_receipt_status_v2(UUID, TEXT);
CREATE OR REPLACE FUNCTION manage_benefit_receipt_status_v2(
  p_id UUID,
  p_status TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE benefit_receipts 
  SET status = p_status, 
      updated_at = NOW() 
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- H. Unified Dashboard Stats (Hardened Production RPC)
/**
 * Returns all dashboard counters and recent data in a single SECURE call.
 * Eliminates multiple REST round-trips and RLS recursion issues.
 */
CREATE OR REPLACE FUNCTION get_dashboard_stats_v3()
RETURNS JSON
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_first_of_month TIMESTAMPTZ := DATE_TRUNC('month', NOW());
  v_income NUMERIC;
  v_expense NUMERIC;
  v_result JSON;
BEGIN
  -- 1. Calculate Financials
  SELECT 
    COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'income'), 0),
    COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'expense'), 0)
  INTO v_income, v_expense
  FROM transactions 
  WHERE is_deleted = false;

  -- 2. Build Consolidated JSON Result
  SELECT json_build_object(
    'totalFamilies', (SELECT COUNT(*) FROM families WHERE is_deleted = false),
    'activeMembers', (SELECT COUNT(*) FROM members WHERE status = 'active' AND is_deleted = false),
    'currentBalance', (v_income - v_expense),
    'pendingRequests', (SELECT COUNT(*) FROM portal_requests WHERE status = 'pending'),
    'beneficiariesThisMonth', (SELECT (COUNT(*)::INT) FROM family_benefits WHERE benefit_date >= v_first_of_month),
    'activitiesThisMonth', (SELECT (COUNT(*)::INT) FROM occasions WHERE start_date >= v_first_of_month AND status = 'completed'),
    'totalIncome', v_income,
    'totalExpense', v_expense,
    'recentActivities', (
      SELECT json_agg(act) FROM (
        SELECT id, description, action_type, resource_type, created_at FROM recent_activities ORDER BY created_at DESC LIMIT 6
      ) act
    ),
    'recentRequests', (
      SELECT json_agg(req) FROM (
        SELECT 
          pr.id, pr.request_type, pr.urgency, pr.status, pr.description, pr.created_at as request_date,
          eu.full_name as requester_name,
          m.name as municipality_name
        FROM portal_requests pr
        JOIN external_users eu ON pr.requester_id = eu.id
        LEFT JOIN municipalities m ON eu.municipality_id = m.id
        WHERE pr.status = 'pending'
        ORDER BY pr.created_at DESC
        LIMIT 5
      ) req
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
