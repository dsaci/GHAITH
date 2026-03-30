-- ═══════════════════════════════════════════════════════════════════
-- GHAYTH PLATFORM — ADVANCED FEATURES & 2024 ARCHIVING
-- ═══════════════════════════════════════════════════════════════════

-- ── TASK 1: ACTIVITY LOGS (DASHBOARD) ──────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_name VARCHAR(150),
  action_type VARCHAR(50), -- 'create', 'update', 'delete'
  resource_type VARCHAR(50), -- 'family', 'member', 'donor', 'benefit'
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger function to log activities automatically
CREATE OR REPLACE FUNCTION log_resource_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_user_name TEXT;
  v_description TEXT;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF (TG_TABLE_NAME = 'families') THEN
      v_description := 'تم تسجيل عائلة ' || NEW.family_name;
    ELSIF (TG_TABLE_NAME = 'members') THEN
      v_description := 'تمت إضافة العضو ' || NEW.full_name;
    ELSIF (TG_TABLE_NAME = 'donors') THEN
      v_description := 'تم تسجيل المحسن ' || NEW.full_name;
    ELSIF (TG_TABLE_NAME = 'family_benefits') THEN
      v_description := 'تم تقديم مساعدة لـ عائلة ' || (SELECT family_name FROM families WHERE id = NEW.family_id);
    END IF;
    
    INSERT INTO activity_logs (action_type, resource_type, description)
    VALUES ('create', TG_TABLE_NAME, v_description);
    
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS trg_log_family ON families;
CREATE TRIGGER trg_log_family AFTER INSERT ON families FOR EACH ROW EXECUTE FUNCTION log_resource_activity();

DROP TRIGGER IF EXISTS trg_log_member ON members;
CREATE TRIGGER trg_log_member AFTER INSERT ON members FOR EACH ROW EXECUTE FUNCTION log_resource_activity();

DROP TRIGGER IF EXISTS trg_log_donor ON donors;
CREATE TRIGGER trg_log_donor AFTER INSERT ON donors FOR EACH ROW EXECUTE FUNCTION log_resource_activity();

-- ── TASK 3: 2024 REPORTS ARCHIVING ─────────────────────────────────

-- Table for literary reports
CREATE TABLE IF NOT EXISTS reports_literary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  activity_date DATE NOT NULL,
  category VARCHAR(50), -- 'humanitarian', 'educational', 'social'
  description TEXT NOT NULL,
  beneficiaries_text TEXT,
  year INTEGER DEFAULT 2024,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for financial records (deep archive)
CREATE TABLE IF NOT EXISTS reports_financial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_literary_id UUID REFERENCES reports_literary(id),
  title VARCHAR(300) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  transaction_type VARCHAR(10) CHECK (transaction_type IN ('income','expense')),
  transaction_date DATE NOT NULL,
  category VARCHAR(50),
  year INTEGER DEFAULT 2024,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clear previous 2024 seed data to ensure clean state
TRUNCATE reports_financial CASCADE;
TRUNCATE reports_literary CASCADE;

-- Seeding: June 2024 - Dec 2024
DO $$
DECLARE
  v_rep_id UUID;
BEGIN
  -- June 3-5: BEM support
  INSERT INTO reports_literary (title, activity_date, category, description, beneficiaries_text)
  VALUES ('دعم مترشحي شهادة التعليم المتوسط (BEM)', '2024-06-03', 'educational', 'توزيع المياه المعدنية على المترشحين في مراكز إجراء الامتحان لولاية المسيلة.', 'مترشحي شهادة التعليم المتوسط')
  RETURNING id INTO v_rep_id;
  INSERT INTO reports_financial (report_literary_id, title, amount, transaction_type, transaction_date, category)
  VALUES (v_rep_id, 'مصاريف اقتناء مياه معدنية (BEM)', 45000.00, 'expense', '2024-06-03', 'إطعام');

  -- June 9-13: BAC support
  INSERT INTO reports_literary (title, activity_date, category, description, beneficiaries_text)
  VALUES ('دعم مترشحي شهادة البكالوريا (BAC)', '2024-06-09', 'educational', 'توزيع المياه المعدنية والمناديل الورقية بمركز إجراء البكالوريا والمساهمة في تهيئة الظروف المناسبة.', 'مترشحي شهادة البكالوريا')
  RETURNING id INTO v_rep_id;
  INSERT INTO reports_financial (report_literary_id, title, amount, transaction_type, transaction_date, category)
  VALUES (v_rep_id, 'مصاريف مبادرة البكالوريا', 62000.00, 'expense', '2024-06-09', 'إطعام');

  -- Weekly Friday distribution (Placeholder for the recurring activity in reports)
  INSERT INTO reports_literary (title, activity_date, category, description, beneficiaries_text)
  VALUES ('توزيع المياه الأسبوعي (سقي عابر سبيل)', '2024-06-21', 'humanitarian', 'توزيع مياه الشرب كل يوم جمعة لعابري السبيل والمسافرين عبر المحطات الرئيسية.', '150-200 مستفيد أسبوعياً')
  RETURNING id INTO v_rep_id;
  INSERT INTO reports_financial (report_literary_id, title, amount, transaction_type, transaction_date, category)
  VALUES (v_rep_id, 'تكلفة المياه الأسبوعية (شهر جوان)', 28000.00, 'expense', '2024-06-30', 'سقي');

  -- Fruit/Veg distribution
  INSERT INTO reports_literary (title, activity_date, category, description, beneficiaries_text)
  VALUES ('توزيع سلال الفواكه والخضر الأسبوعي', '2024-07-06', 'humanitarian', 'توزيع سلال خضر وفواكه طازجة على العائلات المعوزة المسجلة كل سبت.', '20-28 عائلة أسبوعياً')
  RETURNING id INTO v_rep_id;
  INSERT INTO reports_financial (report_literary_id, title, amount, transaction_type, transaction_date, category)
  VALUES (v_rep_id, 'مشتريات الخضر والفواكه (شهر جويلية)', 125000.00, 'expense', '2024-07-31', 'غذاء');

  -- Regular Distributions (June, July, Aug)
  INSERT INTO reports_literary (title, activity_date, category, description, beneficiaries_text)
  VALUES ('توزيع طرود غذائية وملابس (دورة جوان)', '2024-06-28', 'social', 'تسليم حصص غذائية دورية وملابس للعائلات المسجلة بالمكتب الولائي بمدينة المسيلة.', 'العائلات المسجلة')
  RETURNING id INTO v_rep_id;
  INSERT INTO reports_financial (report_literary_id, title, amount, transaction_type, transaction_date, category)
  VALUES (v_rep_id, 'مصاريف طرود جوان الغذائية', 210000.00, 'expense', '2024-06-25', 'غذاء');

  INSERT INTO reports_literary (title, activity_date, category, description, beneficiaries_text)
  VALUES ('توزيع طرود غذائية وملابس (دورة جويلية)', '2024-07-29', 'social', 'استمرارية العمل الدوري لتغطية حاجيات الأسر المسجلة بفرع المسيلة وبوسعادة.', 'العائلات المسجلة')
  RETURNING id INTO v_rep_id;
  INSERT INTO reports_financial (report_literary_id, title, amount, transaction_type, transaction_date, category)
  VALUES (v_rep_id, 'مصاريف طرود جويلية الغذائية', 195000.00, 'expense', '2024-07-25', 'غذاء');

  -- September: Back to School
  INSERT INTO reports_literary (title, activity_date, category, description, beneficiaries_text)
  VALUES ('مبادرة "العودة للمدرسة" (2024)', '2024-09-15', 'educational', 'توزيع 245 حقيبة مدرسية مجهزة بالكامل و180 حقيبة فارغة على اليتامى وأبناء العائلات المعوزة.', '425 تلميذ (245 مجهّزة + 180 فارغة)')
  RETURNING id INTO v_rep_id;
  INSERT INTO reports_financial (report_literary_id, title, amount, transaction_type, transaction_date, category)
  VALUES (v_rep_id, 'مصاريف الحقيبة المدرسية 2024', 850000.00, 'expense', '2024-09-10', 'تربية');

  -- October: Kharmam Convoy
  INSERT INTO reports_literary (title, activity_date, category, description, beneficiaries_text)
  VALUES ('قافلة "خرمام" الإغاثية', '2024-10-20', 'humanitarian', 'قافلة تضامنية مشتركة مع جمعية كافل اليتيم لتوزيع حقائب مدرسية، طرود غذائية وملابس شتوية.', '40 تلميذ + 30 عائلة')
  RETURNING id INTO v_rep_id;
  INSERT INTO reports_financial (report_literary_id, title, amount, transaction_type, transaction_date, category)
  VALUES (v_rep_id, 'مساهمة الجمعية في قافلة خرمام', 180000.00, 'expense', '2024-10-15', 'قافلة');

  -- November: Winter Donations
  INSERT INTO reports_literary (title, activity_date, category, description, beneficiaries_text)
  VALUES ('حملة شتاء دافئ: استلام تبرعات كبيرة', '2024-11-10', 'humanitarian', 'استقبال شحنة كبيرة من الملابس الشتوية والأفرشة من محسنين لصالح حملة الشتاء.', 'تجهيز مخزون الشتاء')
  RETURNING id INTO v_rep_id;
  INSERT INTO reports_financial (report_literary_id, title, amount, transaction_type, transaction_date, category)
  VALUES (v_rep_id, 'تقدير قيمة تبرعات ملابس شتوية (عينية)', 350000.00, 'income', '2024-11-10', 'تبرع_عيني');

  -- December: Hot Dinners
  INSERT INTO reports_literary (title, activity_date, category, description, beneficiaries_text)
  VALUES ('مبادرة الوجبات الساخنة (عشاوات دافئة)', '2024-12-05', 'humanitarian', 'توزيع وجبات عشاء ساخنة على عابري السبيل والأشخاص بدون مأوى في الليالي الباردة.', 'عابري سبيل وأشخاص بدون مأوى')
  RETURNING id INTO v_rep_id;
  INSERT INTO reports_financial (report_literary_id, title, amount, transaction_type, transaction_date, category)
  VALUES (v_rep_id, 'مصاريف وجبات العشاء الساخنة (دورة 1)', 32000.00, 'expense', '2024-12-05', 'إطعام');

  -- December: Ben Srour Convoy
  INSERT INTO reports_literary (title, activity_date, category, description, beneficiaries_text)
  VALUES ('قافلة غيث الكبرى (بن سرور)', '2024-12-20', 'humanitarian', 'أضخم قافلة طبية وإغاثية: فحوصات طبية، أدوية، طرود غذائية، ملابس، أفرشة، ومدفئات.', 'سكان بلدية بن سرور والقرى المجاورة')
  RETURNING id INTO v_rep_id;
  INSERT INTO reports_financial (report_literary_id, title, amount, transaction_type, transaction_date, category)
  VALUES (v_rep_id, 'مصاريف قافلة بن سرور الكبرى', 1200000.00, 'expense', '2024-12-18', 'قافلة_طبية');

END $$;
