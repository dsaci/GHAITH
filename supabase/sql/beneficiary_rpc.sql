-- ═══════════════════════════════════════════════════════════════════
-- GHAYTH PLATFORM — BENEFICIARY PORTAL SECURITY BYPASS (RPC)
-- ═══════════════════════════════════════════════════════════════════

-- وظيفة آمنة لجلب الاستفادات للمستفيدين (تتخطى الـ RLS داخلياً)
-- لكنها تتحقق يدوياً من تطابق رقم التسجيل لضمان الأمان
CREATE OR REPLACE FUNCTION get_beneficiary_benefits(p_family_id UUID, p_reg_no TEXT)
RETURNS TABLE (
    id UUID,
    family_id UUID,
    benefit_type VARCHAR,
    amount DECIMAL,
    quantity INTEGER,
    description TEXT,
    benefit_date DATE,
    occasion_id UUID,
    approved_by UUID,
    branch_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER -- هذا يسمح للوظيفة بتخطي الـ RLS (لأن المستفيد مجهول بالنسبة للقاعدة)
AS $$
BEGIN
    -- التحقق من وجود العائلة ومطابقة رقم التسجيل (ككلمة مرور)
    IF EXISTS (
        SELECT 1 FROM families 
        WHERE families.id = p_family_id 
        AND families.registration_number = p_reg_no
        AND families.is_deleted = false
    ) THEN
        RETURN QUERY 
        SELECT 
            fb.id,
            fb.family_id,
            fb.benefit_type,
            fb.amount,
            fb.quantity,
            fb.description,
            fb.benefit_date,
            fb.occasion_id,
            fb.approved_by,
            fb.branch_id,
            fb.notes,
            fb.created_at
        FROM family_benefits fb
        WHERE fb.family_id = p_family_id
        ORDER BY fb.benefit_date DESC;
    ELSE
        -- إذا لم يتطابق رقم التسجيل، لا يتم إرجاع أي بيانات
        RETURN;
    END IF;
END;
$$;

-- منح إذن التشغيل للمستخدم الرئيسي والمجهول (anon) لتمكين البوابة
GRANT EXECUTE ON FUNCTION get_beneficiary_benefits(UUID, TEXT) TO anon, authenticated;
