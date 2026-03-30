-- 1. إصلاح أذونات الاستفادات للمستفيدين (بوابة المستفيد)
DROP POLICY IF EXISTS "benefits_access_v2" ON family_benefits;
CREATE POLICY "benefits_access_v3" ON family_benefits FOR SELECT TO authenticated
USING (
    -- إما أن يكون المستخدم إدارياً بصلاحيات محددة
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND (
            role IN ('president', 'vice_president', 'treasurer', 'board_member', 'secretary')
            OR (role = 'branch_president' AND branch_id = family_benefits.branch_id)
        )
    )
    OR 
    -- أو أن يكون هو المستفيد نفسه المرتبط بهذه العائلة
    family_id IN (
        SELECT family_id FROM beneficiary_portal WHERE id = auth.uid()
    )
);

-- 2. توفير نفس الإذن لسجل الوصولات (ليتمكن المستفيد من رؤية وصولاته)
DROP POLICY IF EXISTS "receipts_select" ON benefit_receipts;
CREATE POLICY "receipts_select_v2" ON benefit_receipts FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND (
            role IN ('president', 'vice_president', 'treasurer', 'board_member', 'secretary')
            OR (role = 'branch_president' AND branch_id = benefit_receipts.branch_id)
        )
    )
    OR 
    family_id IN (
        SELECT family_id FROM beneficiary_portal WHERE id = auth.uid()
    )
);

-- 3. التأكد من أن المشرفين يمكنهم رؤية جدول بوابة المستفيدين (للربط والتشخيص)
ALTER TABLE beneficiary_portal ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "portal_admin_select" ON beneficiary_portal;
CREATE POLICY "portal_admin_select" ON beneficiary_portal FOR SELECT TO authenticated
USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid()) OR (id = auth.uid())
);
