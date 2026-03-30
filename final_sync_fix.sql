-- ═══════════════════════════════════════════════════════════════════
-- GHAITH FINAL SYNC & SECURITY RECOVERY (Master Fix)
-- ═══════════════════════════════════════════════════════════════════

-- 1. إصلاح جدول المصروفات (للربط بالعائلات)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id);

-- 2. إعادة بناء جدول التتبع (audit_logs) ليتطابق مع الكود البرمجي
DROP TABLE IF EXISTS audit_logs CASCADE;
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- معرف الشخص الذي قام بالعملية
    user_type TEXT, -- إداري أو مستفيد
    action TEXT, -- نوع العملية (create, update, delete, login)
    resource_type TEXT, -- نوع الجدول (families, benefits, etc.)
    resource_id TEXT, -- معرف السجل المتأثر
    new_values JSONB, -- البيانات الجديدة
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. إنشاء جدول سجل الدخول (login_history)
DROP TABLE IF EXISTS login_history CASCADE;
CREATE TABLE login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    login_time TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. تفعيل سياسات الأمان (RLS) بأسلوب احترافي ومبسط
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- سياسة الإضافة: مسموحة لكل مستخدم مسجل (لضمان عمل التتبع دون توقف)
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "login_history_insert" ON login_history FOR INSERT TO authenticated WITH CHECK (true);

-- سياسة القراءة: للمشرفين فقط
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('president', 'vice_president', 'treasurer')));

-- 5. إصلاح جذري لسياسة الوصول للاستفادات (family_benefits) لضمان ظهور النتائج
-- سنقوم بتبسيط السياسة لضمان أن الإدارة ترى كل شيء والمناديب يرون فروعهم
DROP POLICY IF EXISTS "benefits_access" ON family_benefits;
CREATE POLICY "benefits_access_v2" ON family_benefits FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND (
            role IN ('president', 'vice_president', 'treasurer', 'board_member', 'secretary') -- الإدارة الولائية ترى كل شيء
            OR (role = 'branch_president' AND branch_id = family_benefits.branch_id) -- الإدارة البلدية ترى فرعها
        )
    )
);

-- 6. تحديث عرض النشاطات الأخيرة (recent_activities) بمحرك بحث شامل
DROP VIEW IF EXISTS recent_activities CASCADE;
CREATE OR REPLACE VIEW recent_activities AS
(
  -- العائلات الجديدة
  SELECT id::text, 'تم تسجيل عائلة جديدة: ' || family_name as description, 'create' as action_type, 'family' as resource_type, created_at FROM families WHERE is_deleted = false
)
UNION ALL
(
  -- الاستفادات المالية والعينية
  SELECT 
    b.id::text, 
    'إستفادة (' || 
    CASE b.benefit_type 
      WHEN 'financial_aid' THEN 'منحة مالية'
      WHEN 'ramadan_basket' THEN 'قفة رمضان'
      ELSE b.benefit_type 
    END || '): ' || f.family_name as description,
    'create' as action_type,
    'family' as resource_type,
    b.created_at
  FROM family_benefits b
  JOIN families f ON f.id = b.family_id
)
UNION ALL
(
  -- المالية والمصروفات
  SELECT id::text, (CASE WHEN transaction_type = 'income' THEN 'مدخول: ' ELSE 'مصروف: ' END) || description as description, 'create' as action_type, 'finance' as resource_type, created_at FROM transactions WHERE is_deleted = false
)
UNION ALL
(
  -- السجلات الآلية (المحسنون، الأعضاء، إلخ)
  SELECT id::text, description, action_type, resource_type, created_at FROM activity_logs
)
ORDER BY created_at DESC;

-- ملاحظة: تم استخدام gen_random_uuid() لضمان التوافق مع آخر إصدارات قاعدة البيانات.
