-- سكريبت إصلاح مشكلة الدخول (Database error querying schema) 
-- السبب: محرك Supabase (GoTrue) ينهار إذا كانت حقول التوكنات (tokens) فارغة تماماً (NULL) بدلاً من أن تكون نصاً فارغاً ('').

UPDATE auth.users
SET 
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{"provider":"email","providers":["email"]}'::jsonb),
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  recovery_token = COALESCE(recovery_token, '')
WHERE raw_app_meta_data IS NULL 
   OR confirmation_token IS NULL 
   OR email_change IS NULL 
   OR email_change_token_new IS NULL 
   OR recovery_token IS NULL;
