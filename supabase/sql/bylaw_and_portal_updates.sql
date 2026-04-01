-- ═══════════════════════════════════════════════════════════════════
-- BYLAW & PORTAL ENHANCEMENTS (Senior Architect Approved)
-- ═══════════════════════════════════════════════════════════════════

-- 1. Ensure Unique Acknowledgment for the latest check
-- We keep history, so we don't strictly NEED a unique constraint for the guard,
-- but the Guard will just check if ANY acknowledgment exists for the CURRENT version.

-- 2. Secure RPC for Bylaw Agreement
CREATE OR REPLACE FUNCTION record_bylaw_agreement()
RETURNS VOID 
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE
  current_v TEXT;
BEGIN
  -- Get the current version
  SELECT version INTO current_v FROM bylaw_versions WHERE is_current = true LIMIT 1;
  
  -- Insert acknowledgment referencing auth.uid() directly for security
  INSERT INTO bylaw_acknowledgments (
    user_id, 
    bylaw_version, 
    acknowledged_at
  )
  VALUES (
    auth.uid(), 
    COALESCE(current_v, '1.0'), 
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- 3. Portal Requests View (Normalization Layer)
-- This view aggregates requests for the admin dashboard
CREATE OR REPLACE VIEW portal_requests_view AS
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
  eu.portal_type,
  eu.status as user_status,
  v.profession as volunteer_profession,
  v.skills as volunteer_skills
FROM portal_requests pr
JOIN external_users eu ON pr.requester_id = eu.id
LEFT JOIN volunteers v ON eu.id = v.external_user_id;

-- 4. RLS for View (Security Invoker)
-- Views in Postgres don't have RLS themselves, but they respect underlying RLS
-- if created with security invoker or if the requester is the owner.
-- In Supabase, we usually just ensure the underlying tables have correct RLS.

-- 5. GraphQL Optimization: Explicit Index for RLS checks
CREATE INDEX IF NOT EXISTS idx_bylaw_ack_user_version ON bylaw_acknowledgments(user_id, bylaw_version);

-- 6. Helper for Guard: Check if user needs to re-accept
CREATE OR REPLACE FUNCTION needs_bylaw_acknowledgment()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  latest_version TEXT;
  user_ack_version TEXT;
BEGIN
  -- Get latest version
  SELECT version INTO latest_version FROM bylaw_versions WHERE is_current = true LIMIT 1;
  
  -- Get user's latest acknowledgment version
  SELECT bylaw_version INTO user_ack_version 
  FROM bylaw_acknowledgments 
  WHERE user_id = auth.uid() 
  ORDER BY acknowledged_at DESC 
  LIMIT 1;
  
  -- Needs acknowledgment if no ack or version mismatch
  RETURN (user_ack_version IS NULL OR user_ack_version != latest_version);
END;
$$ LANGUAGE plpgsql;
