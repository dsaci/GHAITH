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

-- F. Get Paginated Portal Requests (Admin RPC)
CREATE OR REPLACE FUNCTION get_portal_requests_paginated(
  p_limit INT,
  p_offset INT
)
RETURNS TABLE (
  request_id UUID,
  request_type TEXT,
  urgency TEXT,
  request_status TEXT,
  description TEXT,
  requested_at TIMESTAMPTZ,
  user_id UUID,
  full_name TEXT,
  phone TEXT,
  portal_type TEXT,
  user_status TEXT,
  volunteer_profession TEXT,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id as request_id,
    pr.request_type,
    pr.urgency,
    pr.status as request_status,
    pr.description,
    pr.created_at as requested_at,
    eu.id as user_id,
    eu.full_name,
    eu.phone,
    eu.portal_type::TEXT,
    eu.status as user_status,
    v.occupation as volunteer_profession,
    COUNT(*) OVER() as total_count
  FROM portal_requests pr
  JOIN external_users eu ON pr.requester_id = eu.id
  LEFT JOIN volunteers v ON v.external_user_id = eu.id
  ORDER BY pr.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- G. Update Portal Request Status (Admin RPC)
CREATE OR REPLACE FUNCTION update_portal_request_status(
  p_request_id UUID,
  p_status TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE portal_requests 
  SET status = p_status 
  WHERE id = p_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. PERFORMANCE & INTEGRITY (INDEXES)
-- ───────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_bylaw_ack_user_version
ON bylaw_acknowledgments(user_id, bylaw_version);

CREATE INDEX IF NOT EXISTS idx_portal_requests_status
ON portal_requests(status);

CREATE INDEX IF NOT EXISTS idx_external_users_status
ON external_users(status);
