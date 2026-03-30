-- ═══════════════════════════════════════════════════════════════════
-- RPC: verify_beneficiary
-- Author: Antigravity
-- Purpose: Allows authentication for beneficiaries without exposing the 
--          whole families table via public SELECT.
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION verify_beneficiary(p_reg_no text, p_phone text)
RETURNS TABLE (
    id uuid,
    family_name varchar,
    registration_number varchar,
    phone varchar
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT f.id, f.family_name, f.registration_number, f.phone
    FROM families f
    WHERE (f.registration_number ILIKE p_reg_no)
      AND f.phone = p_phone
      AND f.is_deleted = false
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Grant access to anon and authenticated roles
GRANT EXECUTE ON FUNCTION verify_beneficiary(text, text) TO anon;
GRANT EXECUTE ON FUNCTION verify_beneficiary(text, text) TO authenticated;
