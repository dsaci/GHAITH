import os

data = """بلواضح حياة | 04 | أرملة | 0658211561
دفاف وريدة | 04 | أرملة | 0655700408
مزاري سعاد | 03 | مطلقة | 0673850081
قارة نصيرة | 03 | أرملة | 0676085097
زيتوني فضيلة | 05 | مطلقة/ إعاقة أولاد | 0673889149
6: قوادرية عمر | 04 | معوز/ زوج معاق | 0669046775
سعداوي سعيدة | 03 | مطلقة | 0663569271
حزي مريم | 03 | مطلقة | 0664653775
سعيدي حميدة | 04 | معوز | 0665821940 / 0771093949
تواتي حسين | 03 | معوز/ زوج معاق | 0662118402
بن عزي صبرينة | 04 | معوزة | 0672912373
بن قبي خالد | 06 | معوز/ زوج معاق | 0673176588
براح لطيفة | 03 | مطلقة | 0674616538
بن جدو نوال | 04 | مطلقة | 0783383040
بن ميمونة عامر | 03 | معوز/ زوج معاق | 0664337280
سلماني إيمان | 02 | مطلقة | 0663766332
حافري إيمان | 02 | مطلقة | 0663785518
منصور العيد | 04 | معوز/ الزوج مريض صرع | 0655479424
بومدين صالح | 04 | معوز | 0671934193
راجعي عبد الجليل | 03 | معوز | 0667588213
غالية نبيلة | 04 | مطلقة | 0666218010
بختي صورية | 03 | مطلقة | 0663405833
سراي لخضر | 04 | معوز/ مريض سرطان | 0667828206
خرخاش خضرة | 03 | مطلقة | 0674524119
دحمون محمد | 04 | معوز/ مريض سرطان | 0664028393
رزق الله النوي | 04 | معوز/ زوج معاق | 0771537372 / 0664977973
عيش مليكة | 05 | أرملة | 0655497920
سالم آسيا | 03 | مطلقة | 0699068807
ضيف الله كمال | 04 | معوز/زوج معاق | 0696035832
طبي عيسى | 02 | معوز/زوج معاق | 0671664049
ضيف الله أحمد | 04 | معوز/زوج معاق | 0696001206
تومي فوزية زوجة بهي الدين دحمان | null | معوزة/ مرض السرطان | 0655894320
معاش أوريدة | 02 | أرملة | 0655894320
سواعدية رضوان | 04 | معوز/زوج معاق | 0676402613
شترة مصطفى | 03 | معوز | 0664110490
باي راقد حيزية زوجة جراد عبد الرزاق | 04 | أرملة | 0670891018
أحمد قاضي بلال | 02 | معوز/ زوج معاق | 0676495218
بن لعوبي عدنان | 04 | معوز | 0660790416
جمال ساتة | 03 | معوز/ إعاقة حركية | 0672385587
والي فاروق | 02 | معوز | 0794101228
لعشاش السعيد | 03 | معوز/ بنات مكفوفين | 0659635424
ياحي عبد الرزاق | null | معوز/ كفيف | 0772789646
شايب ربي شافية | 02 | مطلقة | 0668833383 / 0672097075
فرحات محفوظ | 06 | معوز/معاق | 0671667289
نويبات إيمان | null | الزوج في السجن | null
سعدي ريحانة | null | مطلقة | null
بلحسين يوسف | 03 | معوز/معاق | 0665726024
ضباب السعدية | 03 | مطلقة | 0659664272
منصور الربح | null | مطلقة | 0697942955
دهيمي الحاجة | 01 | مطلقة | 0671353274
بودية شريفة | 04 | مطلقة | 0672269908
العياشي حاج | 02 | معوز | null
خبيزي شيماء | 03 | متزوجة | 0672176588
بلعجوز عبد القادر | null | متزوج | null
دهيمي سليمة | 04 | مطلقة | 0553976225 (حي 504 مسكن)
منصور فاطمة | 02 | مطلقة | حي المنكوبين
زروقة السعدية | 03 | مطلقة | حي 05 جويلية
صديقي فتيحة | 02 | مطلقة | حي 1000 مسكن
خيراني علي | 02 | معوز | 0668156463
ساسي عصام | 02 | معوز | 0770338475 (حي القطب)
بوضياف أحمد | null | null | null
قلمين مسعودة | null | null | null
مقري زكية | 04 | مطلقة | null
دهيمي محمد | 03 | معوز | حي 1000 مسكن
قنفود نجاة | 05 | مطلقة | 0658977332 (حي 270 مسكن)
مناصرية خوخة | 01 | مطلقة | 0563567407 (حي القطب)
ميمون طاهر | null | معوز | null
بن ناصر سفيان | null | معوز | حي 05 جويلية
بوعافية سورية | 03 | مطلقة | 0773286531 (حي 270 مسكن)
مخناش نور الدين | 04 | معوز | 0669531511 (حي 150 مسكن)
مكي نور | 01 | مطلقة | حي المويلحة
صحراوي شريف | 02 | معوز | 0670121755 (حي 05 جويلية)
بن خوخة بوخالفة | null | معوز+ مريض سرطان | 0674231650 (العماير)
حموش صورية | 00 | معوزة | 0778130765 (حي لاروكاد)
داود حميد | 04 | معوز+ ابن معاق | 0774487858 (حي الصومام)
اراس الله حبيبة | 02 | ارملة | سيدي هجرس
سامعي مصطفى | 02 | معوز | حي الكوش
ميرة زهرة | 01 | مطلقة | 0655259255 (حي القطب)
حدة تروني | 04 | مطلقة | 0799709976 (اشبيليا)
دحماني نورة | 04 | معوزة | 0772162937 (سونتاكس)
زغلاش فاطمة | 03 | معوزة + زوج في السجن | حي 5 جويلية
بوجلال نسيمة | 03 | ارملة | حي لاروكاد
جوادي نبيلة | 04 | مطلقة | 0656650061 (حي 100 مسكن)
منصور فايزة | 02 | مطلقة | 322 مسكن
بن يونس منصف | 03 | معوز | حي 800 مسكن
مشقق عبد العزيز | 00 | من ذوي الاحتياجات | 0784078034 (أولاد دراج)
محمودي عبد القادر | null | معوز+ ذوي الاحتياجات | 0660080826 (سونتاكس)
دهيمي اسامة | 03 | معوز | حي اشبيليا القديمة
خيضري بلقاسم | 04 | معوز | 0676569659 (أولاد احمد)
جيعيجع ع الحميد | null | null | حمام الضلعة
جعيجع العيد | null | null | تارمونت
سالمي سكينة | 03 | ارملة | قرفالة
غالية اسماء | 03 | مطلقة | 0654823425 (300 مسكن)"""

doctors_data = """د/ دلاخ عيسى | جراحة عامة | 0661000111
د/ بن مبروك عادل | طب وجراحة العيون | 0661000222
د/ حميدو هشام | طب الأطفال | 0661000333
د/ خيري عبد الحميد | طب عام | 0661000444
د/ غضبان نادية | طب النساء والتوليد | 0661000555
د/ عماد كحول | جراحة العظام | 0661000666"""

donors_data = """محسن مجهول | anonymous | 0 | individual
مؤسسة الهلال للأشغال | company | 150000 | company
متبرع فاعل خير | individual | 50000 | individual"""

families_sql = []
for i, line in enumerate(data.strip().split('\n')):
    parts = [p.strip() for p in line.split('|')]
    if len(parts) < 4: continue
    
    name = parts[0]
    size_str = parts[1].replace('null', '0')
    size = int(size_str) if size_str.isdigit() else 1
    if size == 0: size = 1
    
    status_raw = parts[2]
    status = 'other'
    if 'أرملة' in status_raw or 'ارملة' in status_raw: status = 'widow'
    elif 'مطلقة' in status_raw: status = 'divorced'
    elif 'سرطان' in status_raw or 'مرض' in status_raw: status = 'chronic_illness'
    elif 'معاق' in status_raw or 'كفيف' in status_raw or 'احتياجات' in status_raw or 'إعاقة' in status_raw or 'مكفوفين' in status_raw: status = 'disabled'
    elif 'معوز' in status_raw: status = 'poor_family'
    
    contact_info = parts[3].replace('null', '')
    address = "المسيلة"
    if '(' in contact_info:
        # Extract address from parenthesis e.g. 0553976225 (حي 504 مسكن)
        addr = contact_info.split('(')[1].split(')')[0]
        phone = contact_info.split('(')[0].strip()
        address = addr
    elif 'مسكن' in contact_info or 'حي' in contact_info or 'الضلعة' in contact_info or 'تارمونت' in contact_info or 'قرفالة' in contact_info:
        address = contact_info
        phone = ''
    else:
        phone = contact_info

    if phone == '': phone = 'لا يوجد'
    
    reg_no = f"FAM-{2000 + i:04d}"
    
    sql = f"  ('{reg_no}', '{name.replace('''\'''', '''\'\'''')}', '{phone}', '{address.replace('''\'''', '''\'\'''')}', '{status}', {size}, msila_id)"
    families_sql.append(sql)

doctors_sql = []
for i, line in enumerate(doctors_data.strip().split('\n')):
    parts = [p.strip() for p in line.split('|')]
    name, profession, phone = parts
    mem_no = f"DOC-{100 + i}"
    sql = f"  ('{name}', admin_branch_id, 'active', '{mem_no}', CURRENT_DATE, '{phone}', '{profession}')"
    doctors_sql.append(sql)

donors_sql = []
for i, line in enumerate(donors_data.strip().split('\n')):
    parts = [p.strip() for p in line.split('|')]
    name, d_type, total, cat = parts
    is_anon = 'true' if d_type == 'anonymous' else 'false'
    comp = f"'{name}'" if cat == 'company' else "NULL"
    sql = f"  ('{cat}', '{name}', '0550000000', '{name}@email.com', 'المسيلة', msila_id, {comp}, 'none', {is_anon}, {total}, admin_branch_id)"
    donors_sql.append(sql)

values_str = ",\n".join(families_sql)
doctors_str = ",\n".join(doctors_sql)
donors_str = ",\n".join(donors_sql)

out = f"""-- 11_seed_real_data.sql
-- Run in Supabase SQL editor to seed the real data provided in the instructions.

-- Clear all transactional and dependent data to allow deleting dummy users
DELETE FROM saved_reports;
DELETE FROM documents;
DELETE FROM inventory_movements;
DELETE FROM meetings;
DELETE FROM mail_registry;
DELETE FROM transactions;
DELETE FROM family_benefits;
DELETE FROM occasions;
DELETE FROM portal_requests;
DELETE FROM beneficiary_portal;
DELETE FROM families;
DELETE FROM volunteer_logs;
DELETE FROM volunteers;
DELETE FROM donor_profiles;
DELETE FROM external_users;
DELETE FROM members;

-- Now safe to delete dummy profiles and users (except admin)
DELETE FROM user_profiles WHERE role != 'admin';
DELETE FROM auth.users WHERE email != 'admin@ghaith.dz';

-- Increase phone column size to accommodate multiple numbers (e.g., 066... / 077...)
ALTER TABLE families ALTER COLUMN phone TYPE VARCHAR(100);
ALTER TABLE members ALTER COLUMN phone TYPE VARCHAR(100);

-- Update the check constraint to include 'divorced', an important category in the real data
ALTER TABLE families DROP CONSTRAINT IF EXISTS families_category_check;
ALTER TABLE families ADD CONSTRAINT families_category_check CHECK (
  category IN ('widow', 'disabled', 'chronic_illness', 'orphan', 'poor_family', 'other', 'divorced')
);

DO $$
DECLARE
  msila_id UUID;
  admin_branch_id UUID;
  default_pw TEXT := crypt('Ghaith2026', gen_salt('bf'));
  
  -- Executive UUIDs
  id_ahmed UUID := '00000000-0000-0000-0000-000000000001';
  id_aref  UUID := '00000000-0000-0000-0000-000000000002';
  id_rachid UUID := '00000000-0000-0000-0000-000000000003';
  id_hamza UUID := '00000000-0000-0000-0000-000000000004';
  id_abdennour UUID := '00000000-0000-0000-0000-000000000005';
  id_mokhtar UUID := '00000000-0000-0000-0000-000000000006';

BEGIN
  SELECT id INTO msila_id FROM municipalities WHERE name = 'المسيلة' LIMIT 1;
  SELECT id INTO admin_branch_id FROM branches WHERE branch_name = 'المكتب الولائي - المسيلة' LIMIT 1;

  -- Insert Executives into auth.users First!
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES 
  ('00000000-0000-0000-0000-000000000000', id_ahmed, 'authenticated', 'authenticated', 'president.ahmed@ghaith.dz', default_pw, NOW(), '{{"provider":"email","providers":["email"]}}', '{{"full_name":"ابراهيمي أحمد أشرف"}}', NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', id_aref, 'authenticated', 'authenticated', 'vice1.aref@ghaith.dz', default_pw, NOW(), '{{"provider":"email","providers":["email"]}}', '{{"full_name":"زحزام عارف"}}', NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', id_rachid, 'authenticated', 'authenticated', 'vice2.rachid@ghaith.dz', default_pw, NOW(), '{{"provider":"email","providers":["email"]}}', '{{"full_name":"بريكي رشيد"}}', NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', id_hamza, 'authenticated', 'authenticated', 'sg.hamza@ghaith.dz', default_pw, NOW(), '{{"provider":"email","providers":["email"]}}', '{{"full_name":"قادري حمزة"}}', NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', id_abdennour, 'authenticated', 'authenticated', 'tres.abdennour@ghaith.dz', default_pw, NOW(), '{{"provider":"email","providers":["email"]}}', '{{"full_name":"ساسي عبد النور"}}', NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', id_mokhtar, 'authenticated', 'authenticated', 'astres.mokhtar@ghaith.dz', default_pw, NOW(), '{{"provider":"email","providers":["email"]}}', '{{"full_name":"جيلط مختار"}}', NOW(), NOW(), '', '', '', '');

  -- Insert Executives into user_profiles
  INSERT INTO user_profiles (id, full_name, role, branch_id, is_active) VALUES
  (id_ahmed, 'ابراهيمي أحمد أشرف', 'president', admin_branch_id, true),
  (id_aref, 'زحزام عارف', 'vice_president', admin_branch_id, true),
  (id_rachid, 'بريكي رشيد', 'vice_president', admin_branch_id, true),
  (id_hamza, 'قادري حمزة', 'board_member', admin_branch_id, true),
  (id_abdennour, 'ساسي عبد النور', 'treasurer', admin_branch_id, true),
  (id_mokhtar, 'جيلط مختار', 'board_member', admin_branch_id, true);

  -- Insert Executives into Members Table
  INSERT INTO members (full_name, address, profession, membership_type, branch_id, membership_number, membership_date, phone) VALUES
  ('ابراهيمي أحمد أشرف', 'حي الاداري المسيلة', 'عامل - 3 ثانوي تقني سام GRH', 'founder', admin_branch_id, 'MEM-0001', CURRENT_DATE, 'غير متوفر'),
  ('زحزام عارف', 'حي 570 مسكن المسيلة', 'موظف - ثالثة ثانوي', 'founder', admin_branch_id, 'MEM-0002', CURRENT_DATE, 'غير متوفر'),
  ('بريكي رشيد', 'حي نوارة المطارفة', 'تاجر - جامعي ماستر', 'founder', admin_branch_id, 'MEM-0003', CURRENT_DATE, 'غير متوفر'),
  ('قادري حمزة', 'حي 608 مسكن المسيلة', 'أستاذ رئيسي التعليم المتوسط', 'founder', admin_branch_id, 'MEM-0004', CURRENT_DATE, 'غير متوفر'),
  ('ساسي عبد النور', 'حي مدرسة أول نوفمبر', 'أستاذ التعليم الابتدائي', 'founder', admin_branch_id, 'MEM-0005', CURRENT_DATE, 'غير متوفر'),
  ('جيلط مختار', 'حي 250/500 مسكن المسيلة', 'عامل - ثالثة ثانوي TS تقني سامي', 'founder', admin_branch_id, 'MEM-0006', CURRENT_DATE, 'غير متوفر');

  -- Insert General Members into Members Table
  INSERT INTO members (full_name, branch_id, membership_type, membership_number, membership_date, phone) VALUES
  ('عادل علواني', admin_branch_id, 'active', 'MEM-0007', CURRENT_DATE, 'غير متوفر'),
  ('رقيق عبد الرحمان', admin_branch_id, 'active', 'MEM-0008', CURRENT_DATE, 'غير متوفر'),
  ('ساسي نجم الدين', admin_branch_id, 'active', 'MEM-0009', CURRENT_DATE, 'غير متوفر'),
  ('أمينة قويدري', admin_branch_id, 'active', 'MEM-0010', CURRENT_DATE, 'غير متوفر'),
  ('غضبان صلاح', admin_branch_id, 'active', 'MEM-0011', CURRENT_DATE, 'غير متوفر'),
  ('جمعي سعيد', admin_branch_id, 'active', 'MEM-0012', CURRENT_DATE, 'غير متوفر'),
  ('صوالحي عمار', admin_branch_id, 'active', 'MEM-0013', CURRENT_DATE, 'غير متوفر'),
  ('لسبط رضوان', admin_branch_id, 'active', 'MEM-0014', CURRENT_DATE, 'غير متوفر'),
  ('لخضر بوعكاز', admin_branch_id, 'active', 'MEM-0015', CURRENT_DATE, 'غير متوفر'),
  ('ميمون خضرة', admin_branch_id, 'active', 'MEM-0016', CURRENT_DATE, 'غير متوفر'),
  ('جغبوب أشواق', admin_branch_id, 'active', 'MEM-0017', CURRENT_DATE, 'غير متوفر'),
  ('بوقرة فوزية', admin_branch_id, 'active', 'MEM-0018', CURRENT_DATE, 'غير متوفر'),
  ('بلباي نسيمة', admin_branch_id, 'active', 'MEM-0019', CURRENT_DATE, 'غير متوفر'),
  ('عماد بلفار', admin_branch_id, 'active', 'MEM-0020', CURRENT_DATE, 'غير متوفر'),
  ('سعيد حناش', admin_branch_id, 'active', 'MEM-0021', CURRENT_DATE, 'غير متوفر'),
  ('عبدالرزاق العايب', admin_branch_id, 'active', 'MEM-0022', CURRENT_DATE, 'غير متوفر');

  -- Insert Medical Team (Doctors)
  INSERT INTO members (full_name, branch_id, status, membership_number, membership_date, phone, profession) VALUES
{doctors_str};

  -- Insert Initial Donors
  INSERT INTO donors (donor_type, full_name, phone, email, address, municipality_id, company_name, communication_preference, is_anonymous, total_donated, branch_id) VALUES
{donors_str};

  -- Insert Real Beneficiaries / Families
  INSERT INTO families (registration_number, family_name, phone, address, category, members_count, municipality_id) VALUES
{values_str};

END $$;
"""

os.makedirs('supabase/sql', exist_ok=True)
with open('supabase/sql/11_seed_real_data.sql', 'w', encoding='utf-8') as f:
    f.write(out)
print("SQL file successfully generated!")
