-- ══════════════════════════════════════════════════════
-- سكريبت الإنقاذ الشامل (V12.2) - تفعيل حساب الرئيس أحمد
-- ══════════════════════════════════════════════════════

-- 1️⃣ فك أي قيود قديمة على الأدوار
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('president', 'vice_president', 'treasurer', 'board_member', 'branch_president', 'manager', 'member', 'donor', 'beneficiary'));

-- 2️⃣ تنظيف منصب "الرئيس" لتجنب خطأ Duplicate Key
-- سنقوم بتحويل أي شخص يحمل رتبة رئيس حالياً إلى "عضو" مؤقتاً لإفساح المجال للرئيس أحمد
UPDATE public.user_profiles SET role = 'member' WHERE role = 'president';

-- 3️⃣ إعادة بناء حساب الرئيس أحمد فوراً
DO $$ 
DECLARE 
    v_admin_id UUID;
BEGIN
    -- جلب ID الرئيس من نظام الدخول
    SELECT id INTO v_admin_id FROM auth.users WHERE LOWER(email) = 'president.ahmed@ghaith.dz';

    IF v_admin_id IS NOT NULL THEN
        -- تثبيت الرئيس أحمد كـ "الرئيس الوحيد" للجمعية
        INSERT INTO public.user_profiles (id, full_name, email, role, space, is_active)
        VALUES (v_admin_id, 'رئيس الجمعية (أحمد)', 'president.ahmed@ghaith.dz', 'president', 'admin', true)
        ON CONFLICT (id) DO UPDATE SET role = 'president', space = 'admin', is_active = true;
    END IF;
END $$;

-- 4️⃣ تحديث دالة البروفايل لضمان استقرار الواجهة
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS TABLE (id UUID, full_name TEXT, email TEXT, phone TEXT, role TEXT, space TEXT, branch_id UUID, is_active BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id::UUID, COALESCE(up.full_name, 'عضو')::TEXT, COALESCE(up.email, '')::TEXT, 
        COALESCE(up.phone, '')::TEXT, COALESCE(up.role, 'member')::TEXT, 
        COALESCE(up.space, 'member')::TEXT, up.branch_id::UUID, COALESCE(up.is_active, true)
    FROM public.user_profiles up WHERE up.id = auth.uid();
END;
$$;
