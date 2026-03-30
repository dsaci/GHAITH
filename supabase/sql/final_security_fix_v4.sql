-- 1. إضافة عمود الرمز المختصر للفروع (إذا لم يكن موجوداً) لتفادي خطأ 400
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branches' AND column_name = 'code') THEN
        ALTER TABLE branches ADD COLUMN code VARCHAR(10) UNIQUE;
        -- تحديث الفرع الافتراضي برمز MSL
        UPDATE branches SET code = 'MSL' WHERE branch_name LIKE '%المسيلة%' LIMIT 1;
    END IF;
END $$;

-- 2. تصحيح أذونات الاستفادات للمستفيدين (المسار الصحيح عبر external_users)
DROP POLICY IF EXISTS "benefits_access_v3" ON family_benefits;
CREATE POLICY "benefits_access_v4" ON family_benefits FOR SELECT TO authenticated
USING (
    -- الإداريين
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND (
            role IN ('president', 'vice_president', 'treasurer', 'board_member', 'secretary')
            OR (role = 'branch_president' AND branch_id = family_benefits.branch_id)
        )
    )
    OR 
    -- المستفيدين (الربط عبر auth_id)
    family_id IN (
        SELECT bp.family_id 
        FROM beneficiary_portal bp
        JOIN external_users eu ON bp.external_user_id = eu.id
        WHERE eu.auth_id = auth.uid()
    )
);

-- 3. تصحيح أذونات سجل الوصولات للمستفيدين
DROP POLICY IF EXISTS "receipts_select_v2" ON benefit_receipts;
CREATE POLICY "receipts_select_v3" ON benefit_receipts FOR SELECT TO authenticated
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
        SELECT bp.family_id 
        FROM beneficiary_portal bp
        JOIN external_users eu ON bp.external_user_id = eu.id
        WHERE eu.auth_id = auth.uid()
    )
);
