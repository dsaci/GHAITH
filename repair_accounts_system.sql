-- ══════════════════════════════════════════════════════
-- سكريبت غيث الموحد - الإصدار الماسي (V11.0)
-- حل نهائي وشامل لكل مشاكل الحسابات والتوجيه
-- ══════════════════════════════════════════════════════

-- [1] تنظيف القيود وتحديث الصلاحيات
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('president', 'vice_president', 'treasurer', 'board_member', 'branch_president', 'manager', 'member', 'donor', 'beneficiary'));

-- [2] تحديث دالة جلب البروفايل (نسخة مستقرة جداً)
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS TABLE (id UUID, full_name TEXT, email TEXT, phone TEXT, role TEXT, space TEXT, branch_id UUID, is_active BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id::UUID, COALESCE(up.full_name, 'عضو')::TEXT, COALESCE(up.email, '')::TEXT, 
        COALESCE(up.phone, '')::TEXT, COALESCE(up.role, 'member')::TEXT, 
        COALESCE(up.space, 'member')::TEXT, up.branch_id::UUID, COALESCE(up.is_active, true)
    FROM public.user_profiles up WHERE up.id = auth.uid()
    UNION ALL
    SELECT 
        au.id::UUID, COALESCE(au.raw_user_meta_data->>'full_name', 'عضو جديد')::TEXT, 
        au.email::TEXT, '', 'member'::TEXT, 'member'::TEXT, NULL::UUID, true
    FROM auth.users au WHERE au.id = auth.uid() 
    AND NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid());
END;
$$;

-- [3] مزامنة الحسابات الستة (بلوك برمجي واحد محكم)
DO $$ 
DECLARE 
    v_user_id UUID;
    v_msila_id UUID;
    r RECORD;
BEGIN
    -- تحديد ID فرع المسيلة
    SELECT id INTO v_msila_id FROM public.branches WHERE branch_name LIKE '%المسيلة%' LIMIT 1;

    -- إنشاء جدول البيانات المؤقت
    DROP TABLE IF EXISTS tmp_ghaith_sync;
    CREATE TEMP TABLE tmp_ghaith_sync (full_name TEXT, email TEXT, role TEXT, space TEXT);
    
    INSERT INTO tmp_ghaith_sync VALUES 
    ('صلاح الدين غضبان', 'salah.g@ghaith.dz', 'board_member', 'member'),
    ('نجم الدين ساسي', 'nadjm.saci@ghaith.dz', 'board_member', 'member'),
    ('جغبوب أشواق', 'achwak.j@ghaith.dz', 'board_member', 'member'),
    ('ميمون خضرة', 'khadra.m@ghaith.dz', 'board_member', 'member'),
    ('كعيش ياسمين', 'yasmine.k@ghaith.dz', 'board_member', 'member'),
    ('حلاب أنس عبد المالك', 'anas.hallab@ghaith.dz', 'branch_president', 'branch');

    FOR r IN SELECT * FROM tmp_ghaith_sync LOOP
        -- أ: التأكد من وجود الحساب في نظام المصادقة
        SELECT id INTO v_user_id FROM auth.users WHERE email = r.email;
        IF v_user_id IS NULL THEN
            v_user_id := gen_random_uuid();
            INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role, raw_user_meta_data)
            VALUES (v_user_id, r.email, crypt('Ghaith2026', gen_salt('bf')), NOW(), 'authenticated', 'authenticated', jsonb_build_object('full_name', r.full_name));
        END IF;

        -- ب: إدراج أو تحديث البروفايل
        INSERT INTO public.user_profiles (id, full_name, email, role, space, branch_id, is_active)
        VALUES (v_user_id, r.full_name, r.email, r.role, r.space, CASE WHEN r.role='branch_president' THEN v_msila_id ELSE NULL END, true)
        ON CONFLICT (id) DO UPDATE SET 
            role = EXCLUDED.role, 
            space = EXCLUDED.space, 
            full_name = EXCLUDED.full_name,
            email = EXCLUDED.email;
    END LOOP;
END $$;

-- [4] تحديث السياسات الأمنية النهائية
DROP POLICY IF EXISTS "space_access" ON public.user_profiles;
DROP POLICY IF EXISTS "admin_update_access" ON public.user_profiles;

CREATE POLICY "space_access" ON public.user_profiles FOR SELECT USING (auth.uid() = id OR (SELECT role FROM public.user_profiles WHERE id=auth.uid()) IN ('president','vice_president'));
CREATE POLICY "admin_update_access" ON public.user_profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'president'));

-- [5] تفعيل الحسابات النهائية
UPDATE public.user_profiles SET is_active = true WHERE email LIKE '%@ghaith.dz';
