-- ═══════════════════════════════════════════════════════════════════
-- PRODUCTION HARDENING: SECURITY & MODULAR AUDITING
-- ═══════════════════════════════════════════════════════════════════

-- 1. Security: Prevent Duplicate Version Acknowledgments
-- This ensures a user cannot commit multiple agreements for the same version.
ALTER TABLE bylaw_acknowledgments 
ADD CONSTRAINT unique_user_bylaw_version UNIQUE (user_id, bylaw_version);

-- 2. Audit Logging: High-Fidelity Client Metadata
-- Capturing IP and User-Agent for legal non-repudiation of the charter agreement.
ALTER TABLE bylaw_acknowledgments 
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- 3. Hardened RPC: Capture Metadata Server-Side
-- Updated to automatically pull IP and UA from request headers.
-- Strictly uses auth.uid() for security.
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
  -- 1. Get current version
  SELECT version INTO current_v FROM bylaw_versions WHERE is_current = true LIMIT 1;
  
  -- 2. Extract client metadata from Supabase/PostgREST headers
  -- Supabase exposes headers via current_setting
  SELECT current_setting('request.headers', true)::json INTO headers;
  
  -- x-real-ip or x-forwarded-for are usually present in Supabase
  client_ip := (headers->>'x-real-ip');
  client_ua := (headers->>'user-agent');

  -- 3. Insert acknowledgment with high-fidelity audit trail
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
    client_ip::INET,
    client_ua
  )
  ON CONFLICT (user_id, bylaw_version) 
  DO UPDATE SET 
    acknowledged_at = EXCLUDED.acknowledged_at,
    ip_address = EXCLUDED.ip_address,
    user_agent = EXCLUDED.user_agent;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════
-- PERFORMANCE: SCALING FOR PORTAL GROWTH
-- ═══════════════════════════════════════════════════════════════════

-- 4. High-Performance Indexes for Admin Dashboard
-- These speed up filtering and sorting for thousands of portal requests.
CREATE INDEX IF NOT EXISTS idx_portal_requests_status 
ON portal_requests (status);

CREATE INDEX IF NOT EXISTS idx_portal_requests_created_at_desc 
ON portal_requests (created_at DESC);

-- 5. User Portal Indexing
CREATE INDEX IF NOT EXISTS idx_external_users_portal_type 
ON external_users (portal_type);
