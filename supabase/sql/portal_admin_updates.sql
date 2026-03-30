-- ═══════════════════════════════════════════════════════════════════
-- ADMIN PORTAL UPDATES — GHAYTH PLATFORM
-- Unified views for managing beneficiary requests
-- ═══════════════════════════════════════════════════════════════════

-- 1. Create a view for administrator dashboard and management
CREATE OR REPLACE VIEW view_portal_requests AS
SELECT 
    r.id,
    r.family_id,
    f.family_name as requester_name,
    f.registration_number,
    f.phone as requester_phone,
    m.name as municipality_name,
    r.request_type,
    r.description,
    r.urgency as urgency_level,
    r.status,
    r.internal_notes as reviewer_notes,
    r.created_at as request_date,
    r.reviewed_at as decision_date,
    p.full_name as reviewer_name
FROM portal_requests r
JOIN families f ON r.family_id = f.id
LEFT JOIN municipalities m ON f.municipality_id = m.id
LEFT JOIN user_profiles p ON r.reviewed_by = p.id
WHERE f.is_deleted = false;

-- 2. Add a helper function to quickly get stats for dashboard
CREATE OR REPLACE FUNCTION get_portal_request_stats()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'pending_count', COUNT(*) FILTER (WHERE status = 'pending'),
        'total_requests', COUNT(*),
        'urgent_count', COUNT(*) FILTER (WHERE urgency = 'urgent' AND status = 'pending')
    ) INTO result
    FROM portal_requests;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
