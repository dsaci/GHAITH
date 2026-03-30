-- 1. تحديث جدول المصروفات (لربطها بالعائلات ومنع خطأ 400)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS occasion_id UUID REFERENCES occasions(id);

-- 2. إنشاء جدول سجل الدخول (لمنع خطأ 400)
CREATE TABLE IF NOT EXISTS login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    login_time TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. تفعيل سياسات الأمان للجداول الإدارية (لمنع خطأ 401)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- السماح للمستخدمين بتسجيل نشاطاتهم (INSERT)
DROP POLICY IF EXISTS "allow_insert_audit" ON audit_logs;
CREATE POLICY "allow_insert_audit" ON audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "allow_insert_login_history" ON login_history;
CREATE POLICY "allow_insert_login_history" ON login_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- السماح للإدارة برؤية السجلات (SELECT)
DROP POLICY IF EXISTS "allow_read_audit" ON audit_logs;
CREATE POLICY "allow_read_audit" ON audit_logs FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('president', 'vice_president', 'treasurer', 'secretary'))
);

DROP POLICY IF EXISTS "allow_read_login_history" ON login_history;
CREATE POLICY "allow_read_login_history" ON login_history FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('president', 'vice_president', 'treasurer', 'secretary'))
);

-- 4. تجديد عرض النشاطات الأخيرة لضمان التزامن
DROP VIEW IF EXISTS recent_activities CASCADE;
CREATE OR REPLACE VIEW recent_activities AS
(
  SELECT id::text, 'إضافة عائلة: ' || family_name as description, 'create' as action_type, 'family' as resource_type, created_at FROM families WHERE is_deleted = false
)
UNION ALL
(
  -- قسم الاستفادات العائلية (مهم جداً للتزامن)
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
  SELECT id::text, (CASE WHEN transaction_type = 'income' THEN 'مدخول: ' ELSE 'مصروف: ' END) || description as description, 'create' as action_type, 'finance' as resource_type, created_at FROM transactions WHERE is_deleted = false
)
UNION ALL
(
  -- قسم السجلات الأوتوماتيكية (من الملحق)
  SELECT id::text, description, action_type, resource_type, created_at FROM activity_logs
)
ORDER BY created_at DESC;
