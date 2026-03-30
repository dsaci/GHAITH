-- إنشاء أو تحديث المشرف (المدير العام) لمنصة غيث
DO $$ 
DECLARE 
  v_user_id UUID;
BEGIN
  -- 1. البحث عن الحساب إذا كان موجوداً مسبقاً
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@ghaith.dz';

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    
    -- إنشاء الحساب إذا لم يكن موجوداً
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, 
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
      created_at, updated_at, confirmation_token, email_change, 
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', 
      v_user_id, 
      'authenticated', 
      'authenticated', 
      'admin@ghaith.dz', 
      crypt('admin123456', gen_salt('bf')), 
      NOW(), 
      '{"provider":"email","providers":["email"]}', 
      '{"full_name":"مدير النظام"}', 
      NOW(), NOW(), '', '', '', ''
    );
  ELSE
    -- تحديث كلمة المرور للحساب الموجود لضمان الدخول
    UPDATE auth.users 
    SET encrypted_password = crypt('admin123456', gen_salt('bf'))
    WHERE id = v_user_id;
  END IF;

  -- 2. إعطاء أو تأكيد صلاحية "مدير (president)" للحساب
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (v_user_id, 'المدير العام', 'president')
  ON CONFLICT (id) DO UPDATE 
  SET role = 'president', full_name = 'المدير العام';
  
END $$;
