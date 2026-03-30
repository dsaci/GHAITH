-- 11_seed_real_data.sql
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
  ('00000000-0000-0000-0000-000000000000', id_ahmed, 'authenticated', 'authenticated', 'president.ahmed@ghaith.dz', default_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"ابراهيمي أحمد أشرف"}', NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', id_aref, 'authenticated', 'authenticated', 'vice1.aref@ghaith.dz', default_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"زحزام عارف"}', NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', id_rachid, 'authenticated', 'authenticated', 'vice2.rachid@ghaith.dz', default_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"بريكي رشيد"}', NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', id_hamza, 'authenticated', 'authenticated', 'sg.hamza@ghaith.dz', default_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"قادري حمزة"}', NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', id_abdennour, 'authenticated', 'authenticated', 'tres.abdennour@ghaith.dz', default_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"ساسي عبد النور"}', NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', id_mokhtar, 'authenticated', 'authenticated', 'astres.mokhtar@ghaith.dz', default_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"جيلط مختار"}', NOW(), NOW(), '', '', '', '');

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
  ('د/ دلاخ عيسى', admin_branch_id, 'active', 'DOC-100', CURRENT_DATE, '0661000111', 'جراحة عامة'),
  ('د/ بن مبروك عادل', admin_branch_id, 'active', 'DOC-101', CURRENT_DATE, '0661000222', 'طب وجراحة العيون'),
  ('د/ حميدو هشام', admin_branch_id, 'active', 'DOC-102', CURRENT_DATE, '0661000333', 'طب الأطفال'),
  ('د/ خيري عبد الحميد', admin_branch_id, 'active', 'DOC-103', CURRENT_DATE, '0661000444', 'طب عام'),
  ('د/ غضبان نادية', admin_branch_id, 'active', 'DOC-104', CURRENT_DATE, '0661000555', 'طب النساء والتوليد'),
  ('د/ عماد كحول', admin_branch_id, 'active', 'DOC-105', CURRENT_DATE, '0661000666', 'جراحة العظام');

  -- Insert Initial Donors
  INSERT INTO donors (donor_type, full_name, phone, email, address, municipality_id, company_name, communication_preference, is_anonymous, total_donated, branch_id) VALUES
  ('individual', 'محسن مجهول', '0550000000', 'محسن مجهول@email.com', 'المسيلة', msila_id, NULL, 'none', true, 0, admin_branch_id),
  ('company', 'مؤسسة الهلال للأشغال', '0550000000', 'مؤسسة الهلال للأشغال@email.com', 'المسيلة', msila_id, 'مؤسسة الهلال للأشغال', 'none', false, 150000, admin_branch_id),
  ('individual', 'متبرع فاعل خير', '0550000000', 'متبرع فاعل خير@email.com', 'المسيلة', msila_id, NULL, 'none', false, 50000, admin_branch_id);

  -- Insert Real Beneficiaries / Families
  INSERT INTO families (registration_number, family_name, phone, address, category, members_count, municipality_id) VALUES
  ('FAM-2000', 'بلواضح حياة', '0658211561', 'المسيلة', 'widow', 4, msila_id),
  ('FAM-2001', 'دفاف وريدة', '0655700408', 'المسيلة', 'widow', 4, msila_id),
  ('FAM-2002', 'مزاري سعاد', '0673850081', 'المسيلة', 'divorced', 3, msila_id),
  ('FAM-2003', 'قارة نصيرة', '0676085097', 'المسيلة', 'widow', 3, msila_id),
  ('FAM-2004', 'زيتوني فضيلة', '0673889149', 'المسيلة', 'divorced', 5, msila_id),
  ('FAM-2005', '6: قوادرية عمر', '0669046775', 'المسيلة', 'disabled', 4, msila_id),
  ('FAM-2006', 'سعداوي سعيدة', '0663569271', 'المسيلة', 'divorced', 3, msila_id),
  ('FAM-2007', 'حزي مريم', '0664653775', 'المسيلة', 'divorced', 3, msila_id),
  ('FAM-2008', 'سعيدي حميدة', '0665821940 / 0771093949', 'المسيلة', 'poor_family', 4, msila_id),
  ('FAM-2009', 'تواتي حسين', '0662118402', 'المسيلة', 'disabled', 3, msila_id),
  ('FAM-2010', 'بن عزي صبرينة', '0672912373', 'المسيلة', 'poor_family', 4, msila_id),
  ('FAM-2011', 'بن قبي خالد', '0673176588', 'المسيلة', 'disabled', 6, msila_id),
  ('FAM-2012', 'براح لطيفة', '0674616538', 'المسيلة', 'divorced', 3, msila_id),
  ('FAM-2013', 'بن جدو نوال', '0783383040', 'المسيلة', 'divorced', 4, msila_id),
  ('FAM-2014', 'بن ميمونة عامر', '0664337280', 'المسيلة', 'disabled', 3, msila_id),
  ('FAM-2015', 'سلماني إيمان', '0663766332', 'المسيلة', 'divorced', 2, msila_id),
  ('FAM-2016', 'حافري إيمان', '0663785518', 'المسيلة', 'divorced', 2, msila_id),
  ('FAM-2017', 'منصور العيد', '0655479424', 'المسيلة', 'poor_family', 4, msila_id),
  ('FAM-2018', 'بومدين صالح', '0671934193', 'المسيلة', 'poor_family', 4, msila_id),
  ('FAM-2019', 'راجعي عبد الجليل', '0667588213', 'المسيلة', 'poor_family', 3, msila_id),
  ('FAM-2020', 'غالية نبيلة', '0666218010', 'المسيلة', 'divorced', 4, msila_id),
  ('FAM-2021', 'بختي صورية', '0663405833', 'المسيلة', 'divorced', 3, msila_id),
  ('FAM-2022', 'سراي لخضر', '0667828206', 'المسيلة', 'chronic_illness', 4, msila_id),
  ('FAM-2023', 'خرخاش خضرة', '0674524119', 'المسيلة', 'divorced', 3, msila_id),
  ('FAM-2024', 'دحمون محمد', '0664028393', 'المسيلة', 'chronic_illness', 4, msila_id),
  ('FAM-2025', 'رزق الله النوي', '0771537372 / 0664977973', 'المسيلة', 'disabled', 4, msila_id),
  ('FAM-2026', 'عيش مليكة', '0655497920', 'المسيلة', 'widow', 5, msila_id),
  ('FAM-2027', 'سالم آسيا', '0699068807', 'المسيلة', 'divorced', 3, msila_id),
  ('FAM-2028', 'ضيف الله كمال', '0696035832', 'المسيلة', 'disabled', 4, msila_id),
  ('FAM-2029', 'طبي عيسى', '0671664049', 'المسيلة', 'disabled', 2, msila_id),
  ('FAM-2030', 'ضيف الله أحمد', '0696001206', 'المسيلة', 'disabled', 4, msila_id),
  ('FAM-2031', 'تومي فوزية زوجة بهي الدين دحمان', '0655894320', 'المسيلة', 'chronic_illness', 1, msila_id),
  ('FAM-2032', 'معاش أوريدة', '0655894320', 'المسيلة', 'widow', 2, msila_id),
  ('FAM-2033', 'سواعدية رضوان', '0676402613', 'المسيلة', 'disabled', 4, msila_id),
  ('FAM-2034', 'شترة مصطفى', '0664110490', 'المسيلة', 'poor_family', 3, msila_id),
  ('FAM-2035', 'باي راقد حيزية زوجة جراد عبد الرزاق', '0670891018', 'المسيلة', 'widow', 4, msila_id),
  ('FAM-2036', 'أحمد قاضي بلال', '0676495218', 'المسيلة', 'disabled', 2, msila_id),
  ('FAM-2037', 'بن لعوبي عدنان', '0660790416', 'المسيلة', 'poor_family', 4, msila_id),
  ('FAM-2038', 'جمال ساتة', '0672385587', 'المسيلة', 'disabled', 3, msila_id),
  ('FAM-2039', 'والي فاروق', '0794101228', 'المسيلة', 'poor_family', 2, msila_id),
  ('FAM-2040', 'لعشاش السعيد', '0659635424', 'المسيلة', 'disabled', 3, msila_id),
  ('FAM-2041', 'ياحي عبد الرزاق', '0772789646', 'المسيلة', 'disabled', 1, msila_id),
  ('FAM-2042', 'شايب ربي شافية', '0668833383 / 0672097075', 'المسيلة', 'divorced', 2, msila_id),
  ('FAM-2043', 'فرحات محفوظ', '0671667289', 'المسيلة', 'disabled', 6, msila_id),
  ('FAM-2044', 'نويبات إيمان', 'لا يوجد', 'المسيلة', 'other', 1, msila_id),
  ('FAM-2045', 'سعدي ريحانة', 'لا يوجد', 'المسيلة', 'divorced', 1, msila_id),
  ('FAM-2046', 'بلحسين يوسف', '0665726024', 'المسيلة', 'disabled', 3, msila_id),
  ('FAM-2047', 'ضباب السعدية', '0659664272', 'المسيلة', 'divorced', 3, msila_id),
  ('FAM-2048', 'منصور الربح', '0697942955', 'المسيلة', 'divorced', 1, msila_id),
  ('FAM-2049', 'دهيمي الحاجة', '0671353274', 'المسيلة', 'divorced', 1, msila_id),
  ('FAM-2050', 'بودية شريفة', '0672269908', 'المسيلة', 'divorced', 4, msila_id),
  ('FAM-2051', 'العياشي حاج', 'لا يوجد', 'المسيلة', 'poor_family', 2, msila_id),
  ('FAM-2052', 'خبيزي شيماء', '0672176588', 'المسيلة', 'other', 3, msila_id),
  ('FAM-2053', 'بلعجوز عبد القادر', 'لا يوجد', 'المسيلة', 'other', 1, msila_id),
  ('FAM-2054', 'دهيمي سليمة', '0553976225', 'حي 504 مسكن', 'divorced', 4, msila_id),
  ('FAM-2055', 'منصور فاطمة', 'لا يوجد', 'حي المنكوبين', 'divorced', 2, msila_id),
  ('FAM-2056', 'زروقة السعدية', 'لا يوجد', 'حي 05 جويلية', 'divorced', 3, msila_id),
  ('FAM-2057', 'صديقي فتيحة', 'لا يوجد', 'حي 1000 مسكن', 'divorced', 2, msila_id),
  ('FAM-2058', 'خيراني علي', '0668156463', 'المسيلة', 'poor_family', 2, msila_id),
  ('FAM-2059', 'ساسي عصام', '0770338475', 'حي القطب', 'poor_family', 2, msila_id),
  ('FAM-2060', 'بوضياف أحمد', 'لا يوجد', 'المسيلة', 'other', 1, msila_id),
  ('FAM-2061', 'قلمين مسعودة', 'لا يوجد', 'المسيلة', 'other', 1, msila_id),
  ('FAM-2062', 'مقري زكية', 'لا يوجد', 'المسيلة', 'divorced', 4, msila_id),
  ('FAM-2063', 'دهيمي محمد', 'لا يوجد', 'حي 1000 مسكن', 'poor_family', 3, msila_id),
  ('FAM-2064', 'قنفود نجاة', '0658977332', 'حي 270 مسكن', 'divorced', 5, msila_id),
  ('FAM-2065', 'مناصرية خوخة', '0563567407', 'حي القطب', 'divorced', 1, msila_id),
  ('FAM-2066', 'ميمون طاهر', 'لا يوجد', 'المسيلة', 'poor_family', 1, msila_id),
  ('FAM-2067', 'بن ناصر سفيان', 'لا يوجد', 'حي 05 جويلية', 'poor_family', 1, msila_id),
  ('FAM-2068', 'بوعافية سورية', '0773286531', 'حي 270 مسكن', 'divorced', 3, msila_id),
  ('FAM-2069', 'مخناش نور الدين', '0669531511', 'حي 150 مسكن', 'poor_family', 4, msila_id),
  ('FAM-2070', 'مكي نور', 'لا يوجد', 'حي المويلحة', 'divorced', 1, msila_id),
  ('FAM-2071', 'صحراوي شريف', '0670121755', 'حي 05 جويلية', 'poor_family', 2, msila_id),
  ('FAM-2072', 'بن خوخة بوخالفة', '0674231650', 'العماير', 'chronic_illness', 1, msila_id),
  ('FAM-2073', 'حموش صورية', '0778130765', 'حي لاروكاد', 'poor_family', 1, msila_id),
  ('FAM-2074', 'داود حميد', '0774487858', 'حي الصومام', 'disabled', 4, msila_id),
  ('FAM-2075', 'اراس الله حبيبة', 'سيدي هجرس', 'المسيلة', 'widow', 2, msila_id),
  ('FAM-2076', 'سامعي مصطفى', 'لا يوجد', 'حي الكوش', 'poor_family', 2, msila_id),
  ('FAM-2077', 'ميرة زهرة', '0655259255', 'حي القطب', 'divorced', 1, msila_id),
  ('FAM-2078', 'حدة تروني', '0799709976', 'اشبيليا', 'divorced', 4, msila_id),
  ('FAM-2079', 'دحماني نورة', '0772162937', 'سونتاكس', 'poor_family', 4, msila_id),
  ('FAM-2080', 'زغلاش فاطمة', 'لا يوجد', 'حي 5 جويلية', 'poor_family', 3, msila_id),
  ('FAM-2081', 'بوجلال نسيمة', 'لا يوجد', 'حي لاروكاد', 'widow', 3, msila_id),
  ('FAM-2082', 'جوادي نبيلة', '0656650061', 'حي 100 مسكن', 'divorced', 4, msila_id),
  ('FAM-2083', 'منصور فايزة', 'لا يوجد', '322 مسكن', 'divorced', 2, msila_id),
  ('FAM-2084', 'بن يونس منصف', 'لا يوجد', 'حي 800 مسكن', 'poor_family', 3, msila_id),
  ('FAM-2085', 'مشقق عبد العزيز', '0784078034', 'أولاد دراج', 'disabled', 1, msila_id),
  ('FAM-2086', 'محمودي عبد القادر', '0660080826', 'سونتاكس', 'disabled', 1, msila_id),
  ('FAM-2087', 'دهيمي اسامة', 'لا يوجد', 'حي اشبيليا القديمة', 'poor_family', 3, msila_id),
  ('FAM-2088', 'خيضري بلقاسم', '0676569659', 'أولاد احمد', 'poor_family', 4, msila_id),
  ('FAM-2089', 'جيعيجع ع الحميد', 'لا يوجد', 'حمام الضلعة', 'other', 1, msila_id),
  ('FAM-2090', 'جعيجع العيد', 'لا يوجد', 'تارمونت', 'other', 1, msila_id),
  ('FAM-2091', 'سالمي سكينة', 'لا يوجد', 'قرفالة', 'widow', 3, msila_id),
  ('FAM-2092', 'غالية اسماء', '0654823425', '300 مسكن', 'divorced', 3, msila_id);

END $$;
