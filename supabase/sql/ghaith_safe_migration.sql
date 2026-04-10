-- ═══════════════════════════════════════════════════════════════════
-- GHAITH PLATFORM — SAFE MIGRATION SCRIPT
-- الهدف: تصحيح جميع الأخطاء المكتشفة دون المساس بالبيانات الموجودة
-- الخصائص: آمن - قابل للتكرار - لا يكسر أي شيء قائم
-- الترتيب: يجب تشغيله بعد ghaith_phase1_schema.sql
-- ═══════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────
-- BLOCK A: MISSING TABLES
-- جداول مستخدمة في production_hardening.sql لكنها غير موجودة في schema
-- ────────────────────────────────────────────────────────────────────

-- A1. activity_logs — مستخدم في trigger: log_resource_activity_v2
CREATE TABLE IF NOT EXISTS activity_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID,
  user_name   VARCHAR(150),
  action_type VARCHAR(30) CHECK (action_type IN ('create','update','delete','login','export','approve','reject')),
  resource_type VARCHAR(100),
  description TEXT,
  branch_id   UUID        REFERENCES branches(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- A2. bylaw_versions — مستخدم في record_bylaw_agreement / needs_bylaw_acknowledgment
CREATE TABLE IF NOT EXISTS bylaw_versions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  version     TEXT        NOT NULL DEFAULT '1.0',
  title       VARCHAR(300),
  content     TEXT,
  is_current  BOOLEAN     DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- إدراج نسخة أولية إن لم تكن موجودة
INSERT INTO bylaw_versions (version, title, is_current)
SELECT '1.0', 'النظام الداخلي لمنصة غيث — النسخة الأولى', true
WHERE NOT EXISTS (SELECT 1 FROM bylaw_versions WHERE is_current = true);

-- A3. bylaw_acknowledgments — مستخدم في record_bylaw_agreement + RLS
CREATE TABLE IF NOT EXISTS bylaw_acknowledgments (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  bylaw_version   TEXT        NOT NULL,
  acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address      INET,
  user_agent      TEXT,
  UNIQUE (user_id, bylaw_version)
);

-- ────────────────────────────────────────────────────────────────────
-- BLOCK B: MISSING COLUMNS — external_users
-- أعمدة مستدعاة في get_pending_registrations_v2 و submit_public_volunteer
-- ────────────────────────────────────────────────────────────────────

ALTER TABLE external_users
  ADD COLUMN IF NOT EXISTS social_media   TEXT,
  ADD COLUMN IF NOT EXISTS birth_place    VARCHAR(150);

-- ────────────────────────────────────────────────────────────────────
-- BLOCK C: MISSING COLUMNS — volunteers
-- p_specialization لا يُحفظ — نضيف العمود
-- ────────────────────────────────────────────────────────────────────

ALTER TABLE volunteers
  ADD COLUMN IF NOT EXISTS specialization VARCHAR(150);

-- ────────────────────────────────────────────────────────────────────
-- BLOCK D: MISSING COLUMNS — members
-- manage_member_v2 تحدّث role_in_association غير الموجود
-- ────────────────────────────────────────────────────────────────────

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS role_in_association VARCHAR(100);

-- ────────────────────────────────────────────────────────────────────
-- BLOCK E: MISSING CONSTRAINTS
-- ────────────────────────────────────────────────────────────────────

-- E1. UNIQUE على volunteers.external_user_id
--     مطلوب لـ ON CONFLICT (external_user_id) في submit_public_volunteer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'volunteers_ext_user_unique'
    AND conrelid = 'volunteers'::regclass
  ) THEN
    ALTER TABLE volunteers
      ADD CONSTRAINT volunteers_ext_user_unique UNIQUE (external_user_id);
  END IF;
END $$;

-- E2. UNIQUE على external_users.phone
--     مطلوب لاكتشاف التكرار في submit_public_volunteer / submit_public_help_request
--     نتحقق أولاً من عدم وجود تكرار قبل إضافة القيد
DO $$
DECLARE
  v_duplicates INT;
BEGIN
  SELECT COUNT(*) INTO v_duplicates
  FROM (
    SELECT phone FROM external_users
    WHERE phone IS NOT NULL
    GROUP BY phone HAVING COUNT(*) > 1
  ) t;

  IF v_duplicates = 0 THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'ext_users_phone_unique'
      AND conrelid = 'external_users'::regclass
    ) THEN
      ALTER TABLE external_users
        ADD CONSTRAINT ext_users_phone_unique UNIQUE (phone);
    END IF;
  ELSE
    RAISE NOTICE 'تحذير: يوجد % رقم هاتف مكرر في external_users — تم تخطي إضافة UNIQUE constraint.', v_duplicates;
    RAISE NOTICE 'يرجى تنظيف البيانات المكررة ثم إعادة تشغيل هذا الـ block.';
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────
-- BLOCK F: volunteer_number SEQUENCE
-- دالة submit_public_volunteer لا تُولّد volunteer_number
-- UNIQUE(volunteer_number) موجود في الجدول → NULLs ستكسره
-- ────────────────────────────────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS volunteer_number_seq
  START WITH 1001
  INCREMENT BY 1
  NO MAXVALUE
  CACHE 1;

-- ────────────────────────────────────────────────────────────────────
-- BLOCK G: FIXED RPCs
-- ────────────────────────────────────────────────────────────────────

-- G1. submit_public_volunteer — النسخة المصححة
--     الإصلاحات:
--     ✓ يستخدم p_specialization ويحفظه
--     ✓ ON CONFLICT (external_user_id) يعمل الآن (بعد E1)
--     ✓ يُولّد volunteer_number تلقائياً
--     ✓ يعالج التكرار بـ ON CONFLICT (phone) (بعد E2)
--     ✓ إزالة ::TEXT من new_values في audit_logs
DROP FUNCTION IF EXISTS submit_public_volunteer(text,text,date,text,text,text,text,text,text);
CREATE OR REPLACE FUNCTION submit_public_volunteer(
  p_full_name       TEXT,
  p_phone           TEXT,
  p_birth_date      DATE,
  p_birth_place     TEXT,
  p_municipality_name TEXT,
  p_occupation      TEXT,
  p_specialization  TEXT,
  p_education_level TEXT,
  p_reason          TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id   UUID;
  v_muni_id   UUID;
  v_vol_num   TEXT;
BEGIN
  -- 1. إيجاد البلدية
  SELECT id INTO v_muni_id
  FROM municipalities
  WHERE name = p_municipality_name
  LIMIT 1;

  -- 2. إنشاء المستخدم أو تحديثه بالهاتف (ON CONFLICT آمن بعد E2)
  INSERT INTO external_users (
    full_name, phone, birth_date, birth_place,
    municipality_id, portal_type, status
  ) VALUES (
    p_full_name, p_phone, p_birth_date, p_birth_place,
    v_muni_id, 'volunteer', 'pending'
  )
  ON CONFLICT (phone) DO UPDATE SET
    full_name   = EXCLUDED.full_name,
    birth_date  = EXCLUDED.birth_date,
    birth_place = EXCLUDED.birth_place,
    status      = 'pending'
  RETURNING id INTO v_user_id;

  -- 3. توليد رقم المتطوع
  v_vol_num := 'VOL-' || LPAD(nextval('volunteer_number_seq')::TEXT, 5, '0');

  -- 4. إنشاء ملف المتطوع أو تحديثه (ON CONFLICT آمن بعد E1)
  INSERT INTO volunteers (
    external_user_id, volunteer_number,
    profession, specialization, education_level,
    joined_date
  ) VALUES (
    v_user_id, v_vol_num,
    p_occupation, p_specialization, p_education_level,
    CURRENT_DATE
  )
  ON CONFLICT (external_user_id) DO UPDATE SET
    profession      = EXCLUDED.profession,
    specialization  = EXCLUDED.specialization,
    education_level = EXCLUDED.education_level;

  -- 5. سجل التدقيق — بدون ::TEXT (إصلاح خطأ النوع)
  INSERT INTO audit_logs (
    user_id, user_type, action, resource_type, resource_id, new_values
  ) VALUES (
    v_user_id, 'volunteer', 'create', 'external_users', v_user_id,
    jsonb_build_object('full_name', p_full_name, 'phone', p_phone)
  );

  RETURN json_build_object('success', true, 'user_id', v_user_id, 'volunteer_number', v_vol_num);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- G2. submit_public_help_request — إصلاح ::TEXT في audit_logs
DROP FUNCTION IF EXISTS submit_public_help_request(text,text,text,text,text);
CREATE OR REPLACE FUNCTION submit_public_help_request(
  p_full_name         TEXT,
  p_phone             TEXT,
  p_municipality_name TEXT,
  p_aid_type          TEXT,
  p_description       TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id    UUID;
  v_muni_id    UUID;
  v_request_id UUID;
BEGIN
  SELECT id INTO v_muni_id
  FROM municipalities WHERE name = p_municipality_name LIMIT 1;

  INSERT INTO external_users (
    full_name, phone, municipality_id, portal_type, status
  ) VALUES (
    p_full_name, p_phone, v_muni_id, 'beneficiary', 'pending'
  )
  ON CONFLICT (phone) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    status    = 'pending'
  RETURNING id INTO v_user_id;

  INSERT INTO portal_requests (
    requester_id, request_type, description, status, urgency
  ) VALUES (
    v_user_id, p_aid_type, p_description, 'pending', 'medium'
  ) RETURNING id INTO v_request_id;

  -- إصلاح: بدون ::TEXT
  INSERT INTO audit_logs (
    user_id, user_type, action, resource_type, resource_id, new_values
  ) VALUES (
    v_user_id, 'beneficiary', 'create', 'portal_requests', v_request_id,
    jsonb_build_object('aid_type', p_aid_type)
  );

  RETURN json_build_object('success', true, 'request_id', v_request_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- G3. get_pending_registrations_v2 — إضافة الأعمدة الجديدة
DROP FUNCTION IF EXISTS get_pending_registrations_v2();
CREATE OR REPLACE FUNCTION get_pending_registrations_v2()
RETURNS TABLE (
  id           UUID,
  full_name    TEXT,
  phone        TEXT,
  email        TEXT,
  social_media TEXT,
  portal_type  TEXT,
  status       TEXT,
  address      TEXT,
  birth_date   DATE,
  birth_place  TEXT,
  national_id  TEXT,
  created_at   TIMESTAMPTZ,
  volunteers   JSON,
  portal_requests JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    eu.id,
    eu.full_name,
    eu.phone,
    eu.email,
    eu.social_media,       -- يعمل الآن بعد Block B
    eu.portal_type,
    eu.status,
    eu.address,
    eu.birth_date,
    eu.birth_place,        -- يعمل الآن بعد Block B
    eu.national_id,
    eu.created_at,
    (SELECT json_agg(v.*) FROM volunteers v WHERE v.external_user_id = eu.id),
    (SELECT json_agg(pr.*) FROM portal_requests pr WHERE pr.requester_id = eu.id)
  FROM external_users eu
  WHERE eu.status = 'pending'
  ORDER BY eu.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- G4. manage_member_v2 — إصلاح role_in_association
DROP FUNCTION IF EXISTS manage_member_v2(uuid,text,text,boolean);
CREATE OR REPLACE FUNCTION manage_member_v2(
  p_id                  UUID    DEFAULT NULL,
  p_role_in_association TEXT    DEFAULT NULL,
  p_status              TEXT    DEFAULT NULL,
  p_is_deleted          BOOLEAN DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
  IF p_id IS NOT NULL THEN
    UPDATE members SET
      role_in_association = COALESCE(p_role_in_association, role_in_association),
      status              = COALESCE(p_status, status),
      is_deleted          = COALESCE(p_is_deleted, is_deleted),
      updated_at          = NOW()
    WHERE id = p_id;
    RETURN json_build_object('id', p_id, 'success', true);
  END IF;
  RETURN json_build_object('success', false, 'message', 'Member id is required');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────────────
-- BLOCK H: UPDATE RLS — إضافة الجداول الجديدة للحماية
-- ────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  new_tables TEXT[] := ARRAY['activity_logs', 'bylaw_versions', 'bylaw_acknowledgments'];
  t TEXT;
  pol RECORD;
BEGIN
  FOREACH t IN ARRAY new_tables LOOP
    -- حذف السياسات القديمة إن وجدت
    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE tablename = t AND schemaname = 'public'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, t);
    END LOOP;

    -- قراءة للمستخدمين المسجلين
    EXECUTE format(
      'CREATE POLICY "Authenticated Select Access" ON %I FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL)', t
    );
    -- تعديلات عبر RPC فقط
    EXECUTE format('CREATE POLICY "Pure RPC Mutation Lockdown" ON %I FOR INSERT WITH CHECK (false)', t);
    EXECUTE format('CREATE POLICY "Pure RPC Update Lockdown" ON %I FOR UPDATE USING (false) WITH CHECK (false)', t);
    EXECUTE format('CREATE POLICY "Pure RPC Delete Lockdown" ON %I FOR DELETE USING (false)', t);

    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- ────────────────────────────────────────────────────────────────────
-- BLOCK I: INDEXES — تحسين الأداء
-- ────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_activity_logs_user      ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created   ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ext_users_phone         ON external_users(phone);
CREATE INDEX IF NOT EXISTS idx_ext_users_status        ON external_users(status);
CREATE INDEX IF NOT EXISTS idx_volunteers_ext_user     ON volunteers(external_user_id);

-- ────────────────────────────────────────────────────────────────────
-- BLOCK J: VERIFICATION — تحقق من نجاح التطبيق
-- شغّل هذا الـ block بشكل منفصل بعد التطبيق للتأكد
-- ────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_ok BOOLEAN := true;
  v_msg TEXT;
BEGIN
  -- تحقق من الجداول الجديدة
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'activity_logs' AND schemaname = 'public') THEN
    v_msg := 'FAIL: activity_logs table missing'; v_ok := false;
    RAISE WARNING '%', v_msg;
  ELSE RAISE NOTICE 'OK: activity_logs exists'; END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'bylaw_versions' AND schemaname = 'public') THEN
    v_msg := 'FAIL: bylaw_versions table missing'; v_ok := false;
    RAISE WARNING '%', v_msg;
  ELSE RAISE NOTICE 'OK: bylaw_versions exists'; END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'bylaw_acknowledgments' AND schemaname = 'public') THEN
    v_msg := 'FAIL: bylaw_acknowledgments table missing'; v_ok := false;
    RAISE WARNING '%', v_msg;
  ELSE RAISE NOTICE 'OK: bylaw_acknowledgments exists'; END IF;

  -- تحقق من الأعمدة المضافة
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='external_users' AND column_name='social_media') THEN
    RAISE WARNING 'FAIL: external_users.social_media missing';
  ELSE RAISE NOTICE 'OK: external_users.social_media exists'; END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='external_users' AND column_name='birth_place') THEN
    RAISE WARNING 'FAIL: external_users.birth_place missing';
  ELSE RAISE NOTICE 'OK: external_users.birth_place exists'; END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='volunteers' AND column_name='specialization') THEN
    RAISE WARNING 'FAIL: volunteers.specialization missing';
  ELSE RAISE NOTICE 'OK: volunteers.specialization exists'; END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='role_in_association') THEN
    RAISE WARNING 'FAIL: members.role_in_association missing';
  ELSE RAISE NOTICE 'OK: members.role_in_association exists'; END IF;

  -- تحقق من الـ constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'volunteers_ext_user_unique') THEN
    RAISE WARNING 'FAIL: volunteers_ext_user_unique constraint missing';
  ELSE RAISE NOTICE 'OK: volunteers_ext_user_unique constraint exists'; END IF;

  -- تحقق من الدوال
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'submit_public_volunteer') THEN
    RAISE WARNING 'FAIL: submit_public_volunteer function missing';
  ELSE RAISE NOTICE 'OK: submit_public_volunteer function exists'; END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_pending_registrations_v2') THEN
    RAISE WARNING 'FAIL: get_pending_registrations_v2 function missing';
  ELSE RAISE NOTICE 'OK: get_pending_registrations_v2 function exists'; END IF;

  -- النتيجة النهائية
  IF v_ok THEN
    RAISE NOTICE '══════════════════════════════════════';
    RAISE NOTICE '✓ Migration completed successfully.';
    RAISE NOTICE '══════════════════════════════════════';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- END OF MIGRATION
-- ترتيب التشغيل الموصى به في Supabase SQL Editor:
--   1. ghaith_phase1_schema.sql     (الـ schema الأصلي)
--   2. ghaith_safe_migration.sql    (هذا الملف)
--   3. production_hardening.sql     (الـ RPCs والـ RLS)
--   4. portal_ext_rpc.sql           (RPCs بوابة المستفيدين)
-- ═══════════════════════════════════════════════════════════════════
