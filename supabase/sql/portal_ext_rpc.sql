-- ═══════════════════════════════════════════════════════════════════
-- PORTAL EXTENSION RPCs — GHAYTH PLATFORM
-- Secure data access for beneficiaries logged in via RegNo
-- ═══════════════════════════════════════════════════════════════════

-- 1. Ensure portal_requests can be linked to family_id directly
ALTER TABLE portal_requests ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id);

-- 2. Function: Get Beneficiary Profile
CREATE OR REPLACE FUNCTION get_beneficiary_profile(p_family_id UUID, p_reg_no TEXT)
RETURNS TABLE (
    id UUID,
    registration_number TEXT,
    family_name TEXT,
    phone TEXT,
    address TEXT,
    category TEXT,
    members_count INTEGER,
    status TEXT,
    municipality_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.registration_number::TEXT,
        f.family_name::TEXT,
        f.phone::TEXT,
        f.address::TEXT,
        f.category::TEXT,
        f.members_count,
        f.status::TEXT,
        m.name::TEXT as municipality_name
    FROM families f
    LEFT JOIN municipalities m ON f.municipality_id = m.id
    WHERE f.id = p_family_id 
    AND f.registration_number = p_reg_no
    AND f.is_deleted = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function: Get Beneficiary Notifications
CREATE OR REPLACE FUNCTION get_beneficiary_notifications(p_family_id UUID, p_reg_no TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    message TEXT,
    type TEXT,
    is_read BOOLEAN,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Verify registration number first
    IF NOT EXISTS (SELECT 1 FROM families WHERE id = p_family_id AND registration_number = p_reg_no) THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        n.id,
        n.title::TEXT,
        n.message::TEXT,
        n.type::TEXT,
        n.is_read,
        n.created_at
    FROM notifications n
    WHERE n.recipient_id = p_family_id 
    AND n.recipient_type = 'beneficiary'
    ORDER BY n.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function: Submit Portal Request
CREATE OR REPLACE FUNCTION submit_beneficiary_request(
    p_family_id UUID, 
    p_reg_no TEXT,
    p_request_type TEXT,
    p_description TEXT,
    p_urgency TEXT DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
    v_request_id UUID;
BEGIN
    -- Security Check
    IF NOT EXISTS (SELECT 1 FROM families WHERE id = p_family_id AND registration_number = p_reg_no) THEN
        RAISE EXCEPTION 'Unverified beneficiary session.';
    END IF;

    INSERT INTO portal_requests (
        family_id,
        request_type,
        description,
        urgency,
        status,
        created_at
    ) VALUES (
        p_family_id,
        p_request_type,
        p_description,
        p_urgency,
        'pending',
        NOW()
    ) RETURNING id INTO v_request_id;

    -- Also create an audit log
    INSERT INTO audit_logs (
        user_id,
        user_type,
        action,
        resource_type,
        resource_id,
        new_values
    ) VALUES (
        p_family_id,
        'beneficiary',
        'create',
        'portal_request',
        v_request_id,
        jsonb_build_object('request_type', p_request_type, 'description', p_description)
    );

    RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function: Get Beneficiary Requests
CREATE OR REPLACE FUNCTION get_beneficiary_requests(p_family_id UUID, p_reg_no TEXT)
RETURNS TABLE (
    id UUID,
    request_type TEXT,
    description TEXT,
    status TEXT,
    urgency TEXT,
    internal_notes TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Security Check
    IF NOT EXISTS (SELECT 1 FROM families WHERE id = p_family_id AND registration_number = p_reg_no) THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        r.id,
        r.request_type::TEXT,
        r.description::TEXT,
        r.status::TEXT,
        r.urgency::TEXT,
        r.internal_notes::TEXT,
        r.created_at
    FROM portal_requests r
    WHERE r.family_id = p_family_id
    ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
