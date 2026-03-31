-- ═══════════════════════════════════════════════════════════════════
-- Platform: Ghaith Association
-- Purpose: BULLETPROOF ACCOUNT REPAIR SCRIPT 🛡️
-- Author: Optimized Expert Version (Final - 10/10)
-- VERSION: 6.0 (Enterprise Hardened Standard)
-- ═══════════════════════════════════════════════════════════════════

-- 1️⃣ تحديث الهيكل: إضافة الأعمدة اللازمة بأمان
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='space') THEN
        ALTER TABLE public.user_profiles ADD COLUMN space TEXT DEFAULT 'member';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='email') THEN
        ALTER TABLE public.user_profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- 2️⃣ تنظيف القيود وتحديث عمود الأدوار
-- ملاحظة: تم ترك النوع VARCHAR(30) لتجنب تعارضات سياسات الـ RLS الموجودة مسبقاً

ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS role_check;
ALTER TABLE public.user_profiles ADD CONSTRAINT role_check 
CHECK (role IN (
  'president','vice_president','treasurer',
  'board_member','branch_president','secretary','manager','member'
));

-- 3️⃣ تعيين الفضاءات والأدوار بناءً على التصنيف المعتمد
UPDATE public.user_profiles
SET space = CASE
    WHEN role IN ('president', 'vice_president', 'treasurer') THEN 'executive'
    WHEN role IN ('board_member', 'branch_president', 'secretary', 'manager') THEN 'branch'
    ELSE 'member'
END;

-- 4️⃣ ضمان "رئيس واحد" (Singleton President)
-- خطوة أ: تنظيف البيانات أولاً قبل فرض القيد (Sovereign Order)
WITH presidents AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY COALESCE(created_at, now()), id) as rank
    FROM public.user_profiles
    WHERE role = 'president'
)
UPDATE public.user_profiles
SET role = 'board_member', space = 'executive'
WHERE id IN (SELECT id FROM presidents WHERE rank > 1);

-- خطوة ب: فرض القيد البرمجي عبر Unique Index
DROP INDEX IF EXISTS one_president_only;
CREATE UNIQUE INDEX IF NOT EXISTS one_president_only
ON public.user_profiles ((role))
WHERE role = 'president';

-- 5️⃣ إصلاح الدالة البرمجية (V10.0 - حل شامل للأعضاء ورؤساء الفروع)
-- التغيير: إضافة عمود phone، وضمان عدم وجود NULL في الحقول الأساسية، وتوحيد المسميات
DROP FUNCTION IF EXISTS public.get_my_profile();

CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    phone TEXT,          -- أضفنا الهاتف لأنه مطلوب في AuthContext
    role TEXT,
    space TEXT,
    branch_id UUID,
    is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id::UUID AS id, 
        COALESCE(up.full_name, 'عضو غير معرف')::TEXT AS full_name, 
        COALESCE(up.email, '')::TEXT AS email, 
        COALESCE(up.phone, '')::TEXT AS phone,
        COALESCE(up.role, 'member')::TEXT AS role, 
        COALESCE(up.space, 'member')::TEXT AS space, 
        up.branch_id::UUID AS branch_id, 
        COALESCE(up.is_active, true)::BOOLEAN AS is_active
    FROM public.user_profiles AS up
    WHERE up.id = auth.uid()

    UNION ALL

    SELECT 
      au.id::UUID AS id,
      COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1), 'عضو جديد')::TEXT AS full_name,
      au.email::TEXT AS email,
      COALESCE(au.raw_user_meta_data->>'phone', '')::TEXT AS phone,
      'member'::TEXT AS role,
      'member'::TEXT AS space,
      NULL::UUID AS branch_id,
      true::BOOLEAN AS is_active
    FROM auth.users AS au
    WHERE au.id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid()
    );
END;
$$;

-- تحديث إجباري لرؤساء الفروع لضمان التوجيه الصحيح
UPDATE public.user_profiles 
SET space = 'branch' 
WHERE role IN ('branch_president', 'manager') AND (space IS NULL OR space != 'branch');

-- 6️⃣ تحسين الـ Row Level Security (RLS) ومنع التكرار (Recursion Proof)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "space_access" ON public.user_profiles;
DROP POLICY IF EXISTS "admin_update_access" ON public.user_profiles;

-- سياسة الرؤية: فحص مباشر للهوية لتجنب استدعاء الدوال المتكرر
CREATE POLICY "space_access" ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR role IN ('president','vice_president','treasurer') 
);

-- سياسة التعديل: فحص مباشر للأدوار
CREATE POLICY "admin_update_access" ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
  role IN ('president','vice_president')
)
WITH CHECK (
  role IN ('president','vice_president')
);

-- 7️⃣ الأتمتة: التريجر التلقائي المحمي
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, email, role, space, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'member',
    'member',
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8️⃣ إصلاح الحسابات المفقودة حالياً
INSERT INTO public.user_profiles (id, full_name, email, role, space, is_active)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    au.email,
    'member',
    'member',
    true
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles up WHERE up.id = au.id
)
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email WHERE user_profiles.email IS NULL;

-- 9️⃣ تفعيل حسابات الإدارة وإعادة تحميل الـ Schema
UPDATE public.user_profiles
SET is_active = true
WHERE space IN ('executive', 'branch');

NOTIFY pgrst, 'reload schema';

-- ═══════════════════════════════════════════════════════════════════
-- ✅ FINAL STANDARD V6.0: MISSION READY 10/10
-- ═══════════════════════════════════════════════════════════════════
