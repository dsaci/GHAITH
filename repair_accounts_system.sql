-- ══════════════════════════════════════════════════════
-- سكريبت غيث الذهبي (V11.2) - الحل القاطع والنهائي
-- ══════════════════════════════════════════════════════

-- 1. تحديث دالة البروفايل (V10.3 الشاملة)
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
        au.email::TEXT, '', 'member', 'member', NULL, true
    FROM auth.users au WHERE au.id = auth.uid() 
    AND NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid());
END;
$$;

-- 2. فرض مزامنة الحسابات وكلمات السر (Ghaith2026) لجميع الأسماء المذكورة
DO $$ 
DECLARE 
    v_user_id UUID;
    v_msila_id UUID;
    r RECORD;
BEGIN
    SELECT id INTO v_msila_id FROM public.branches WHERE branch_name LIKE '%المسيلة%' LIMIT 1;
    CREATE TEMP TABLE IF NOT EXISTS tmp_final (name TEXT, email TEXT, role TEXT, space TEXT);
    TRUNCATE tmp_final;
    INSERT INTO tmp_final VALUES 
    ('صلاح الدين غضبان', 'salah.g@ghaith.dz', 'board_member', 'member'),
    ('نجم الدين ساسي', 'nadjm.saci@ghaith.dz', 'board_member', 'member'),
    ('جغبوب أشواق', 'achwak.j@ghaith.dz', 'board_member', 'member'),
    ('ميمون خضرة', 'khadra.m@ghaith.dz', 'board_member', 'member'),
    ('كعيش ياسمين', 'yasmine.k@ghaith.dz', 'board_member', 'member'),
    ('حلاب أنس عبد المالك', 'anas.hallab@ghaith.dz', 'branch_president', 'branch');

    FOR r IN SELECT * FROM tmp_final LOOP
        SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = LOWER(r.email);

        IF v_user_id IS NULL THEN
            v_user_id := gen_random_uuid();
            INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role, raw_user_meta_data)
            VALUES (v_user_id, LOWER(r.email), crypt('Ghaith2026', gen_salt('bf')), NOW(), 'authenticated', 'authenticated', jsonb_build_object('full_name', r.name));
        ELSE
            -- فرض كلمة السر Ghaith2026 للحسابات الموجودة لضمان الحل النهائي
            UPDATE auth.users 
            SET encrypted_password = crypt('Ghaith2026', gen_salt('bf')), 
                email_confirmed_at = COALESCE(email_confirmed_at, NOW()) 
            WHERE id = v_user_id;
        END IF;

        INSERT INTO public.user_profiles (id, full_name, email, role, space, branch_id, is_active)
        VALUES (v_user_id, r.name, LOWER(r.email), r.role, r.space, CASE WHEN r.role='branch_president' THEN v_msila_id ELSE NULL END, true)
        ON CONFLICT (id) DO UPDATE SET 
            role=EXCLUDED.role, 
            space=EXCLUDED.space, 
            is_active=true, 
            full_name=EXCLUDED.full_name, 
            email=EXCLUDED.email;
    END LOOP;
END $$;
