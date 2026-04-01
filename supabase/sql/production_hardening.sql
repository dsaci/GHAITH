-- ═══════════════════════════════════════════════════════════════════
-- GHAITH PLATFORM: PRODUCTION HARDENING (SECURITY & SCALING)
-- ═══════════════════════════════════════════════════════════════════

-- 1. SECURITY: Prevent Duplicate Version Acknowledgments
-- ───────────────────────────────────────────────────────────────────
DO $$ 
BEGIN
    ALTER TABLE bylaw_acknowledgments DROP CONSTRAINT IF EXISTS unique_user_bylaw_version;
    ALTER TABLE bylaw_acknowledgments ADD CONSTRAINT unique_user_bylaw_version UNIQUE (user_id, bylaw_version);
EXCEPTION WHEN OTHERS THEN 
    -- Constraint might already exist from a DIFFERENT migration
END $$;

-- 2. AUDIT LOGGING: High-Fidelity Client Metadata
-- ───────────────────────────────────────────────────────────────────
ALTER TABLE bylaw_acknowledgments 
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- 3. HARDENED RPC: Capture Metadata Server-Side (record_bylaw_agreement)
-- ───────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION record_bylaw_agreement()
RETURNS VOID 
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE
  current_v TEXT;
  client_ip TEXT;
  client_ua TEXT;
  headers JSON;
BEGIN
  -- A. Get current version
  SELECT version INTO current_v FROM bylaw_versions WHERE is_current = true LIMIT 1;
  
  -- B. Extract client metadata from Supabase/PostgREST headers
  BEGIN
    SELECT current_setting('request.headers', true)::json INTO headers;
    client_ip := (headers->>'x-real-ip');
    client_ua := (headers->>'user-agent');
  EXCEPTION WHEN OTHERS THEN
    client_ip := '127.0.0.1';
    client_ua := 'UNKNOWN';
  END;

  -- C. Insert acknowledgment with high-fidelity audit trail
  INSERT INTO bylaw_acknowledgments (
    user_id, 
    bylaw_version, 
    acknowledged_at,
    ip_address,
    user_agent
  )
  VALUES (
    auth.uid(), 
    COALESCE(current_v, '1.0'), 
    NOW(),
    COALESCE(client_ip, '0.0.0.0')::INET,
    COALESCE(client_ua, 'GENERIC')
  )
  ON CONFLICT (user_id, bylaw_version) 
  DO UPDATE SET 
    acknowledged_at = EXCLUDED.acknowledged_at,
    ip_address = EXCLUDED.ip_address,
    user_agent = EXCLUDED.user_agent;
END;
$$ LANGUAGE plpgsql;

-- 4. HELPER FOR GUARD: Check if user needs to re-accept (needs_bylaw_acknowledgment)
-- ───────────────────────────────────────────────────────────────────
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
  
  -- Needs acknowledgment if version mismatch or no record
  RETURN (latest_version IS NOT NULL) AND (user_ack_version IS NULL OR user_ack_version != latest_version);
END;
$$ LANGUAGE plpgsql;

-- 5. PERFORMANCE: Scaling for Portal Growth (Indexes)
-- ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_portal_requests_status ON portal_requests (status);
CREATE INDEX IF NOT EXISTS idx_portal_requests_created_at_desc ON portal_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_external_users_portal_type ON external_users (portal_type);
CREATE INDEX IF NOT EXISTS idx_bylaw_ack_user_version ON bylaw_acknowledgments(user_id, bylaw_version);

-- 6. DATA AGGREGATION: Portal Requests View
-- ───────────────────────────────────────────────────────────────────
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
  v.occupation as volunteer_profession, -- Aligned with Ghaith schema (occupation)
  v.skills as volunteer_skills
FROM portal_requests pr
JOIN external_users eu ON pr.requester_id = eu.id
LEFT JOIN volunteers v ON eu.id = v.external_user_id;

-- 7. RLS ENFORCEMENT: Restrict Direct Client Inserts
-- ───────────────────────────────────────────────────────────────────
ALTER TABLE bylaw_acknowledgments ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can only read their own acknowledgments" ON bylaw_acknowledgments;
    CREATE POLICY "Users can only read their own acknowledgments" 
    ON bylaw_acknowledgments FOR SELECT 
    USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Prevent direct client inserts into acknowledgments" ON bylaw_acknowledgments;
    -- Users must use the record_bylaw_agreement() SECURITY DEFINER function to insert.
    CREATE POLICY "Prevent direct client inserts into acknowledgments" 
    ON bylaw_acknowledgments FOR INSERT 
    WITH CHECK (false); 
END $$;
