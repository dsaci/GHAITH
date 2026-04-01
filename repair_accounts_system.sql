-- ==================================================
-- 🏆 سكريبت الإنقاذ الذهبي - النسخة المصححة V15.4 🏆
-- ==================================================

-- 1. تنظيف الدالات القديمة لتجنب تعارض الأنواع
DROP FUNCTION IF EXISTS public.get_my_profile();

-- 2. تحديث الحسابات والصلاحيات (الرئيس والأعضاء)
DO $$ 
DECLARE 
    v_admin_id UUID;
    v_president_email TEXT := 'president.ahmed@ghaith.dz';
BEGIN
    -- جلب ID الرئيس من جدول المستخدمين
    SELECT id INTO v_admin_id FROM auth.users WHERE LOWER(email) = v_president_email LIMIT 1;

    -- فك قيد "الرئيس الوحيد" (تحويل أي شخص آخر يحمل رتبة رئيس لعضو مؤقتاً)
    UPDATE public.user_profiles SET role = 'member' WHERE role = 'president' AND id != v_admin_id;

    IF v_admin_id IS NOT NULL THEN
        -- تثبيت الرئيس أحمد بالفضاء الصحيح (executive) لفتح سجلات العائلات والمالية
        INSERT INTO public.user_profiles (id, full_name, email, role, space, is_active)
        VALUES (v_admin_id, 'رئيس الجمعية - أحمد', v_president_email, 'president', 'executive', true)
        ON CONFLICT (id) DO UPDATE SET 
            role = 'president', space = 'executive', is_active = true;
            
        -- توحيد كلمة السر للرئيس لسهولة الدخول والاختبار
        UPDATE auth.users SET encrypted_password = crypt('Ghaith2026', gen_salt('bf')) WHERE id = v_admin_id;
    END IF;

    -- مزامنة بقية الأعضاء بكلمة سر موحدة
    UPDATE auth.users SET encrypted_password = crypt('Ghaith2026', gen_salt('bf')) 
    WHERE email IN ('salah.g@ghaith.dz', 'najm.d@ghaith.dz', 'ashwaq.b@ghaith.dz', 'khadra.m@ghaith.dz', 'yasmin.h@ghaith.dz', 'anas.k@ghaith.dz');
END $$;

-- 3. بناء دالة البروفايل المتوافقة مع المتصفح والواجهة
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS JSON AS $$
DECLARE
  profile_record RECORD;
BEGIN
  SELECT id, email, full_name, full_name as "fullName", role, space, branch_id, branch_id as "branchId", phone, is_active, is_active as "isActive"
  FROM public.user_profiles WHERE id = auth.uid()
  INTO profile_record;
  RETURN row_to_json(profile_record);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. فتح سياسات الأمان (RLS) للجداول الصحيحة (transactions و families)
-- تحرير جدول العائلات
ALTER TABLE public.families DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "الوصول الشامل للرئيس" ON public.families;
CREATE POLICY "الوصول الشامل للرئيس" ON public.families FOR ALL USING (true);

-- تحرير جدول المالية (الاسم الصحيح هو transactions)
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "الوصول الشامل للمالية" ON public.transactions;
CREATE POLICY "الوصول الشامل للمالية" ON public.transactions FOR ALL USING (true);

-- تحرير جداول المساعدات وسجلات المستخدمين لضمان عدم ظهور خطأ 500
ALTER TABLE public.family_benefits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_benefits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "الرؤية العامة للمساعدات" ON public.family_benefits;
CREATE POLICY "الرؤية العامة للمساعدات" ON public.family_benefits FOR ALL USING (true);

ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "رؤية الملفات الشخصية" ON public.user_profiles;
CREATE POLICY "رؤية الملفات الشخصية" ON public.user_profiles FOR SELECT USING (true);
