-- ═══════════════════════════════════════════════════════════════════
-- GHAYTH PLATFORM — SEED DATA SCRIPT
-- RUN IN SUPABASE SQL EDITOR TO INJECT ALL REAL DATA FROM DOCUMENTS
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. BYLAW ARTICLES (القانون الأساسي والنظام الداخلي) ─────────────
DELETE FROM bylaw_articles; -- تنظيف الجدول لتجنب التكرار

INSERT INTO bylaw_articles (chapter_number, chapter_title, article_number, article_title, article_content, article_type, display_order, is_active)
VALUES
-- القانون الأساسي
(1, 'الباب الأول: أحكام عامة (التسمية - الموضوع - المقر)', 1, 'التأسيس', 'يؤسس المصرحون جمعية ولائية تخضع لأحكام القانون رقم 06/12 المؤرخ في 12 جانفي 2012.', 'organizational', 1, true),
(1, 'الباب الأول: أحكام عامة', 2, 'التسمية', 'تسمى الجمعية: الجمعية الولائية غيث للعمل الخيري والإنساني.', 'organizational', 2, true),
(1, 'الباب الأول: أحكام عامة', 3, 'الطبيعة', 'الجمعية ذات نشاط خيري إنساني يشترك المؤسسون والمنخرطون في تسخير معارفهم تطوعياً.', 'organizational', 3, true),
(1, 'الباب الأول: أحكام عامة', 4, 'الأهداف', 'القيام بالأعمال الخيرية والتنموية للفئات المعوزة، تقديم قوافل إغاثية، محاربة الآفات الاجتماعية، وتطوير ثقافة التطوع.', 'organizational', 4, true),
(1, 'الباب الأول: أحكام عامة', 5, 'المقر', 'حي مدرسة أول نوفمبر 1954 الابتدائية، المسيلة.', 'organizational', 5, true),
(1, 'الباب الأول: أحكام عامة', 8, 'الإصدارات', 'يسمح للجمعية بإصدار نشرات ومطويات باللغة العربية.', 'organizational', 6, true),

-- شروط الانضمام
(2, 'الباب الثاني: العضوية (الانضمام والانسحاب)', 9, 'تشكيلة الجمعية', 'تتكون الجمعية من أعضاء مؤسسين، ناشطين، وشرفيين.', 'membership', 7, true),
(2, 'الباب الثاني: العضوية', 10, 'شروط العضو الناشط', 'الانضباط، دفع الاشتراك، حضور الاجتماعات، السرية، والمثابرة.', 'membership', 8, true),
(2, 'الباب الثاني: العضوية', 12, 'فقدان العضوية', 'تُفقد العضوية بالاستقالة، الوفاة، عدم دفع الاشتراك لمدة سنة، أو ارتكاب مخالفة تأديبية.', 'membership', 9, true),

-- النظام الداخلي (التحديثات المطلوبة)
(3, 'النظام الداخلي: الانخراط والتنظيم', 1, 'شروط التسجيل', 'إلزامية تقديم نسخة الهوية، رقم الهاتف، وإجراء معاينة ميدانية قبل الاعتماد الخيري.', 'organizational', 10, true),
(3, 'النظام الداخلي: الدعم الطبي', 2, 'سياسة التكفل الطبي', 'تحديد نسبة التكفل بـ 20-30% للتحاليل والأشعة، وتكفل كامل لمرضى السرطان والأيتام.', 'financial', 11, true),
(3, 'النظام الداخلي: إعارة العتاد', 3, 'إدارة العتاد الطبي', 'تحديد مدة الإعارة القصوى بـ 40 يوماً مع تحميل المستفيد مسؤولية التلف.', 'organizational', 12, true),
(3, 'النظام الداخلي: الانضباط', 7, 'تدرج العقوبات', 'تبدأ العقوبات من التنبيه، الإنذار الكتابي، التجميد المؤقت وصولاً للشطب.', 'disciplinary', 13, true);


-- ── 2. GEOGRAPHY & BRANCHES ───────────────────────────────────────
DO $$ 
DECLARE
  v_msila_id UUID;
  v_ain_hadjel_id UUID;
  v_branch_msila_id UUID;
  v_branch_ain_id UUID;
BEGIN
  SELECT id INTO v_msila_id FROM municipalities WHERE name = 'المسيلة' LIMIT 1;
  SELECT id INTO v_ain_hadjel_id FROM municipalities WHERE name = 'عين الحجل' LIMIT 1;

  -- إنشاء فروع الولاية في حال عدم وجودها
  INSERT INTO branches (branch_name, municipality_id, is_active)
  VALUES ('فرع المسيلة المركزي', v_msila_id, true)
  ON CONFLICT DO NOTHING RETURNING id INTO v_branch_msila_id;

  IF v_branch_msila_id IS NULL THEN
    SELECT id INTO v_branch_msila_id FROM branches WHERE branch_name = 'فرع المسيلة المركزي' LIMIT 1;
  END IF;

  INSERT INTO branches (branch_name, municipality_id, is_active)
  VALUES ('فرع عين الحجل', v_ain_hadjel_id, true)
  ON CONFLICT DO NOTHING RETURNING id INTO v_branch_ain_id;

  IF v_branch_ain_id IS NULL THEN
    SELECT id INTO v_branch_ain_id FROM branches WHERE branch_name = 'فرع عين الحجل' LIMIT 1;
  END IF;

  -- تخزين معرفات الفروع كمتغيرات مؤقتة للاستخدام في الخطوة التالية
  PERFORM set_config('myvars.branch_msila_id', v_branch_msila_id::text, false);
  PERFORM set_config('myvars.branch_ain_id', v_branch_ain_id::text, false);
END $$;


-- ── 3. USERS MANAGEMENT (STAFF & MEMBERS) ─────────────────────────
DO $$ 
DECLARE
  v_msila UUID := current_setting('myvars.branch_msila_id')::UUID;
  v_ain UUID := current_setting('myvars.branch_ain_id')::UUID;
  rec RECORD;
  v_user_id UUID;
BEGIN
  -- ادراج الأعضاء وإنشاء حسابات Auth لهم (كلمة المرور الافتراضية Ghaith2026)
  CREATE TEMP TABLE tmp_staff (
    full_name VARCHAR, phone VARCHAR, email VARCHAR, role VARCHAR, branch_id UUID
  );
  
  INSERT INTO tmp_staff VALUES 
  ('حلاب أنس عبد المالك', '0600000001', 'anas.hallab@ghaith.dz', 'branch_president', v_ain),
  ('بوشكارة سليمة ياسمين', '0600000002', 'salima.bouchkara@ghaith.dz', 'vice_president', v_ain),
  ('نجم الدين ساسي', '0600000003', 'nadjm.saci@ghaith.dz', 'board_member', v_msila),
  ('كعيش ياسمين', '0600000004', 'yasmine.k@ghaith.dz', 'board_member', v_msila),
  ('ميمون خضرة', '0600000005', 'khadra.m@ghaith.dz', 'board_member', v_msila),
  ('جغبوب أشواق', '0600000006', 'achwak.j@ghaith.dz', 'board_member', v_msila),
  ('بوقرة فوزية', '0600000007', 'fouzia.b@ghaith.dz', 'board_member', v_msila),
  ('بلباي نسيمة', '0600000008', 'nassima.b@ghaith.dz', 'board_member', v_msila),
  ('عبد السلام شيماء', '0600000009', 'chaima.a@ghaith.dz', 'board_member', v_msila),
  ('هشام زحزام', '0600000010', 'hichem.z@ghaith.dz', 'board_member', v_msila),
  ('غضبان صلاح', '0600000011', 'salah.g@ghaith.dz', 'board_member', v_msila);

  FOR rec IN SELECT * FROM tmp_staff LOOP
    SELECT id INTO v_user_id FROM auth.users WHERE email = rec.email;
    IF v_user_id IS NULL THEN
      v_user_id := gen_random_uuid();
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 
        rec.email, crypt('Ghaith2026', gen_salt('bf')), NOW(), 
        '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, NOW(), NOW(),
        '', '', '', ''
      );
    END IF;

    INSERT INTO public.user_profiles (id, full_name, phone, role, branch_id)
    VALUES (v_user_id, rec.full_name, rec.phone, rec.role, rec.branch_id)
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
  END LOOP;
  
  DROP TABLE tmp_staff;
END $$;

-- ── 4. PARTNERS & DOCTORS ─────────────────────────────────────────
DO $$ 
DECLARE
  rec RECORD;
BEGIN
  CREATE TEMP TABLE tmp_doctors (
    doc_name VARCHAR, doc_type VARCHAR, specialty TEXT, phone VARCHAR
  );
  
  INSERT INTO tmp_doctors VALUES 
  ('د. صحراوي خالد', 'individual', 'طب أطفال - حي اشبيليا', '0600000101'),
  ('د. حجاب سمير', 'individual', 'أمراض العظام والمفاصل - مقابل الجامعة', '0600000102'),
  ('د. بوتقجيرات فايزة', 'individual', 'طب أمراض الغدد الصماء', '0600000103'),
  ('سعيد ذوادي', 'individual', 'محسن مكلف بتحاليل السرطان', '0671985276'),
  ('د. حمادي مالك', 'individual', 'طب أطفال - حي 16 مسكن', '0600000104'),
  ('مصحة الحماديين', 'institution', 'عيادة متعددة الخدمات', '0600000105'),
  ('د. بورزق فايزة', 'individual', 'طب أمراض النساء والتوليد', '0600000106'),
  ('د. شريف جمال', 'individual', 'مختص أنف، حنجرة - حي 500 مسكن', '0675796440'),
  ('د. بوتفليقة تيطراوي', 'individual', 'جراح أسنان - حي 70 مسكن', '0553585355'),
  ('مخبر الشفاء', 'institution', 'التحاليل الطبية - سونيتاكس', '0783019992');

  FOR rec IN SELECT * FROM tmp_doctors LOOP
    INSERT INTO donors (full_name, donor_type, notes, phone, communication_preference)
    VALUES (rec.doc_name, rec.doc_type, rec.specialty, rec.phone, 'phone')
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  DROP TABLE tmp_doctors;
END $$;

-- ── 5. FAMILIES (BENEFICIARIES) ───────────────────────────────────
DO $$ 
DECLARE
  rec RECORD;
  v_fam_id UUID;
  v_msila UUID := current_setting('myvars.branch_msila_id')::UUID;
  v_municipality UUID;
BEGIN
  SELECT id INTO v_municipality FROM municipalities WHERE name = 'المسيلة' LIMIT 1;
  
  CREATE TEMP TABLE tmp_fams (
    req_no VARCHAR, full_name VARCHAR, members_count INT, category VARCHAR, phone VARCHAR
  );
  
  INSERT INTO tmp_fams VALUES 
  ('F001', 'بلواضح حياة', 4, 'widow', '0658211561'),
  ('F002', 'دفاف وريدة', 4, 'widow', '0655700408'),
  ('F003', 'مزاري سعاد', 3, 'other', '0673850081'),
  ('F004', 'قارة نصيرة', 3, 'widow', '0676085097'),
  ('F005', 'زيتوني فضيلة', 5, 'disabled', '0673889149'),
  ('F006', 'قوادرية عمر', 4, 'chronic_illness', '0669046775'),
  ('F007', 'سعداوي سعيدة', 3, 'other', '0663569271'),
  ('F008', 'حزي مريم', 3, 'other', '0664653775'),
  ('F009', 'سعيدي حميدة', 4, 'poor_family', '0665821940'),
  ('F010', 'سراي لخضر', 4, 'chronic_illness', '0667828206'), -- مريض سرطان
  ('F011', 'دحمون محمد', 4, 'chronic_illness', '0664028393'), -- مريض سرطان
  ('F012', 'تومي فوزية', 1, 'chronic_illness', '0655894320'), -- مريضة سرطان
  ('F013', 'بن خوخة بوخالفة', 1, 'chronic_illness', '0674231650'), -- مريض سرطان
  ('F014', 'لعشاش السعيد', 3, 'disabled', '0659635424'),
  ('F015', 'ياحي عبد الرزاق', 1, 'disabled', '0772789646');

  FOR rec IN SELECT * FROM tmp_fams LOOP
    INSERT INTO families (registration_number, family_name, phone, address, municipality_id, branch_id, category, members_count, income_level)
    VALUES (rec.req_no, rec.full_name, rec.phone, 'المسيلة', v_municipality, v_msila, rec.category, rec.members_count, 'very_low')
    ON CONFLICT (registration_number) DO NOTHING;
  END LOOP;
  
  DROP TABLE tmp_fams;
END $$;

-- ── 6. INVENTORY UPDATES (FOOD SUPPLIES 2026) ─────────────────────
DO $$ 
DECLARE
  v_msila UUID := current_setting('myvars.branch_msila_id')::UUID;
  rec RECORD;
BEGIN
  CREATE TEMP TABLE tmp_inv (
    item_name VARCHAR, unit VARCHAR, qty DECIMAL
  );
  
  INSERT INTO tmp_inv VALUES 
  ('زيت', 'لتر', 14),
  ('سكر', 'كغ', 301),
  ('ملح', 'كيس', 12),
  ('طماطم', 'علبة', 93),
  ('قهوة', 'علبة', 189),
  ('أرز', 'كغ', 50),
  ('حمص', 'كغ', 0),
  ('زيتون أخضر', 'كغ', 5),
  ('شربة فريك', 'كغ', 0),
  ('شربة فرميسال', 'كيس', 59),
  ('صول', 'علبة', 18),
  ('خل', 'قارورة', 39),
  ('فلو', 'علبة', 55),
  ('ديول', 'ورقة', 50),
  ('طعام (كسكس)', 'كغ', 37),
  ('دقيق', 'كغ', 25),
  ('فرينة', 'كغ', 56);

  FOR rec IN SELECT * FROM tmp_inv LOOP
    INSERT INTO inventory (item_name, item_type, unit, current_quantity, minimum_threshold, branch_id)
    VALUES (rec.item_name, 'مواد غذائية', rec.unit, rec.qty, 10, v_msila)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  DROP TABLE tmp_inv;
END $$;
