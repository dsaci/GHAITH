-- 13_fix_salah_credentials.sql
-- Run in Supabase SQL editor to fix Salah's account and unify naming conventions.
-- Unified Password: Ghaith2026

DO $$ 
DECLARE
  v_user_id UUID;
  default_pw TEXT := crypt('Ghaith2026', gen_salt('bf'));
BEGIN
  -- 1. Correct Salah's Email (Using his full name for consistency)
  -- Search for old account "salah.g@ghaith.dz" or any with his name and update
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'salah.g@ghaith.dz' OR raw_user_meta_data->>'full_name' = 'صلاح الدين غضبان' OR raw_user_meta_data->>'full_name' = 'غضبان صلاح';
  
  IF v_user_id IS NOT NULL THEN
    UPDATE auth.users 
    SET email = 'salah.ghadbane@ghaith.dz', 
        encrypted_password = default_pw,
        raw_user_meta_data = jsonb_build_object('full_name', 'صلاح الدين غضبان')
    WHERE id = v_user_id;

    UPDATE public.user_profiles 
    SET full_name = 'صلاح الدين غضبان',
        is_active = true
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Updated existing Salah account to salah.ghadbane@ghaith.dz';
  ELSE
    -- Create fresh if not exists
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 
      'salah.ghadbane@ghaith.dz', default_pw, NOW(), 
      '{"provider":"email","providers":["email"]}'::jsonb, 
      '{"full_name":"صلاح الدين غضبان"}'::jsonb, 
      NOW(), NOW()
    );

    INSERT INTO public.user_profiles (id, full_name, phone, role, is_active)
    VALUES (v_user_id, 'صلاح الدين غضبان', '0600000011', 'board_member', true);
    
    RAISE NOTICE 'Created new Salah account: salah.ghadbane@ghaith.dz';
  END IF;
END $$;
