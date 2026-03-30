-- 12_activate_members.sql
-- Run in Supabase SQL editor to create login accounts for all general members.
-- Unified Password: Ghaith2026

DO $$ 
DECLARE
  v_msila_id UUID;
  v_user_id UUID;
  rec RECORD;
  default_pw TEXT := crypt('Ghaith2026', gen_salt('bf'));
BEGIN
  -- Get Msila branch ID
  SELECT id INTO v_msila_id FROM branches WHERE branch_name = 'المكتب الولائي - المسيلة' OR branch_name = 'فرع المسيلة المركزي' LIMIT 1;

  -- Create Temp Table for Members
  CREATE TEMP TABLE tmp_members_to_activate (
    full_name VARCHAR, email VARCHAR, phone VARCHAR, role VARCHAR
  );

  INSERT INTO tmp_members_to_activate VALUES 
  ('عادل علواني', 'adel.alouani@ghaith.dz', '0600000021', 'board_member'),
  ('رقيق عبد الرحمان', 'abderrahmane.reguieg@ghaith.dz', '0600000022', 'board_member'),
  ('أمينة قويدري', 'amina.kouidri@ghaith.dz', '0600000023', 'board_member'),
  ('جمعي سعيد', 'said.djemai@ghaith.dz', '0600000024', 'board_member'),
  ('صوالحي عمار', 'ammar.soualhi@ghaith.dz', '0600000025', 'board_member'),
  ('لسبط رضوان', 'redouane.lasbet@ghaith.dz', '0600000026', 'board_member'),
  ('لخضر بوعكاز', 'lakhdar.bouakkaz@ghaith.dz', '0600000027', 'board_member'),
  ('عماد بلفار', 'imad.belfar@ghaith.dz', '0600000028', 'board_member'),
  ('سعيد حناش', 'said.hannache@ghaith.dz', '0600000029', 'board_member'),
  ('عبدالرزاق العايب', 'abderrezak.layeb@ghaith.dz', '0600000030', 'board_member');

  -- Loop and Create
  FOR rec IN SELECT * FROM tmp_members_to_activate LOOP
    -- Check if user exists in auth.users by email
    SELECT id INTO v_user_id FROM auth.users WHERE email = rec.email;
    
    IF v_user_id IS NULL THEN
      v_user_id := gen_random_uuid();
      
      -- 1. Create Auth User
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 
        rec.email, default_pw, NOW(), 
        '{"provider":"email","providers":["email"]}'::jsonb, 
        jsonb_build_object('full_name', rec.full_name), 
        NOW(), NOW(), '', '', '', ''
      );

      -- 2. Create User Profile
      INSERT INTO public.user_profiles (id, full_name, phone, role, branch_id, is_active)
      VALUES (v_user_id, rec.full_name, rec.phone, rec.role, v_msila_id, true)
      ON CONFLICT (id) DO UPDATE SET 
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        is_active = true;
        
      RAISE NOTICE 'Activated user % with email %', rec.full_name, rec.email;
    ELSE
      -- User exists, update profile just in case
      UPDATE public.user_profiles 
      SET is_active = true, role = rec.role
      WHERE id = v_user_id;
      RAISE NOTICE 'User % already existed, ensured active status.', rec.full_name;
    END IF;
  END LOOP;

  DROP TABLE tmp_members_to_activate;
END $$;
