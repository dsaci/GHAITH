-- 1. Ensure Najm Eddine Saci exists
DO $$ 
DECLARE
  v_user_id UUID;
  v_email TEXT := 'nadjm.saci@ghaith.dz';
  v_full_name TEXT := 'نجم الدين ساسي';
  default_pw TEXT := crypt('Ghaith2026', gen_salt('bf'));
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 
      v_email, default_pw, NOW(), 
      '{"provider":"email","providers":["email"]}'::jsonb, 
      jsonb_build_object('full_name', v_full_name), 
      NOW(), NOW()
    );
  END IF;

  INSERT INTO public.user_profiles (id, full_name, phone, role, is_active)
  VALUES (v_user_id, v_full_name, '0600000003', 'board_member', true)
  ON CONFLICT (id) DO UPDATE SET is_active = true, role = 'board_member';
END $$;

-- 2. Ensure Achwak Jaghboub exists
DO $$ 
DECLARE
  v_user_id UUID;
  v_email TEXT := 'achwak.j@ghaith.dz';
  v_full_name TEXT := 'جغبوب أشواق';
  default_pw TEXT := crypt('Ghaith2026', gen_salt('bf'));
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 
      v_email, default_pw, NOW(), 
      '{"provider":"email","providers":["email"]}'::jsonb, 
      jsonb_build_object('full_name', v_full_name), 
      NOW(), NOW()
    );
  END IF;

  INSERT INTO public.user_profiles (id, full_name, phone, role, is_active)
  VALUES (v_user_id, v_full_name, '0600000006', 'board_member', true)
  ON CONFLICT (id) DO UPDATE SET is_active = true, role = 'board_member';
END $$;
