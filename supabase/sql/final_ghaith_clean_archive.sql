-- ═══════════════════════════════════════════════════════════════════
-- FINAL COMPREHENSIVE ARCHIVE (2024-2025) — GHAYTH PLATFORM
-- ═══════════════════════════════════════════════════════════════════

DO $$ 
DECLARE
    v_admin_id UUID := (SELECT id FROM user_profiles WHERE role = 'president' LIMIT 1);
    v_msila_branch UUID := (SELECT id FROM branches WHERE branch_name LIKE '%المسيلة%' LIMIT 1);
BEGIN
    -- 1. CLEAN RESET (Financial & Test Data ONLY)
    SET session_replication_role = 'replica';
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions') THEN
        TRUNCATE TABLE transactions RESTART IDENTITY CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'family_benefits') THEN
        TRUNCATE TABLE family_benefits RESTART IDENTITY CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'occasions') THEN
        TRUNCATE TABLE occasions RESTART IDENTITY CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'portal_requests') THEN
        TRUNCATE TABLE portal_requests RESTART IDENTITY CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        TRUNCATE TABLE notifications RESTART IDENTITY CASCADE;
    END IF;

    SET session_replication_role = 'origin';

    -- 2. INSERT LITERARY ARCHIVE (2024)
    INSERT INTO occasions (title, occasion_type, sub_type, description, start_date, end_date, status, branch_id, created_by)
    VALUES 
    ('دعم تلاميذ شهادة التعليم المتوسط BEM 2024', 'educational', 'امتحانات', 'تقديم الدعم المعنوي وتوزيع المياه المعدنية', '2024-06-03', '2024-06-05', 'completed', v_msila_branch, v_admin_id),
    ('دعم تلاميذ شهادة البكالوريا BAC 2024', 'educational', 'امتحانات', 'تقديم الدعم المعنوي وتوزيع المياه المعدنية', '2024-06-09', '2024-06-13', 'completed', v_msila_branch, v_admin_id),
    ('مبادرة الحقيبة المدرسية 2024', 'humanitarian', 'دخول مدرسي', 'توزيع 425 محفظة بلوازمها لفائدة أطفال العائلات المسجلة', '2024-09-15', '2024-09-15', 'completed', v_msila_branch, v_admin_id),
    ('قافلة خرمام التضامنية', 'humanitarian', 'قافلة', 'بالتنسيق مع كافل اليتيم: قفف وألبسة ومحافظ', '2024-10-20', '2024-10-20', 'completed', v_msila_branch, v_admin_id),
    ('قافلة غيث الكبرى - بن سرور', 'humanitarian', 'قافلة', 'قافلة طبية وعينية شاملة تشمل فحوصات وتوزيع مساعدات', '2024-12-20', '2024-12-20', 'completed', v_msila_branch, v_admin_id);

    -- 3. INSERT FINANCIAL TRANSACTIONS (2024-2025)
    
    -- [JUNE 2024]
    INSERT INTO transactions (transaction_type, category, amount, description, transaction_date, branch_id, created_by)
    VALUES 
    ('income', 'donations', 89500.00, 'إجمالي تبرعات شهر جوان 2024', '2024-06-30', v_msila_branch, v_admin_id),
    ('expense', 'social_aid', 21500.00, 'اقتناء مواد غذائية - جوان', '2024-06-25', v_msila_branch, v_admin_id),
    ('expense', 'social_aid', 8000.00, 'اقتناء مياه معدنية - جوان', '2024-06-28', v_msila_branch, v_admin_id);

    -- [JULY 2024]
    INSERT INTO transactions (transaction_type, category, amount, description, transaction_date, branch_id, created_by)
    VALUES 
    ('income', 'donations', 116000.00, 'إجمالي تبرعات شهر جويلية 2024', '2024-07-31', v_msila_branch, v_admin_id),
    ('expense', 'admin_expenses', 71000.00, 'اقتناء مكيف هوائي للمقر', '2024-07-10', v_msila_branch, v_admin_id),
    ('expense', 'admin_expenses', 5000.00, 'اقتناء مروحة للمقر', '2024-07-10', v_msila_branch, v_admin_id),
    ('expense', 'social_aid', 32375.00, 'اقتناء مياه معدنية - جويلية', '2024-07-25', v_msila_branch, v_admin_id),
    ('expense', 'social_aid', 6000.00, 'اقتناء مواد غذائية - جويلية', '2024-07-28', v_msila_branch, v_admin_id);

    -- [AUGUST 2024]
    INSERT INTO transactions (transaction_type, category, amount, description, transaction_date, branch_id, created_by)
    VALUES 
    ('income', 'donations', 76125.00, 'إجمالي تبرعات شهر أوت 2024', '2024-08-31', v_msila_branch, v_admin_id),
    ('expense', 'social_aid', 24050.00, 'اقتناء مياه معدنية - أوت', '2024-08-16', v_msila_branch, v_admin_id),
    ('expense', 'social_aid', 30500.00, 'اقتناء مواد غذائية - أوت', '2024-08-28', v_msila_branch, v_admin_id);

    -- [SEPTEMBER 2024]
    INSERT INTO transactions (transaction_type, category, amount, description, transaction_date, branch_id, created_by)
    VALUES 
    ('income', 'donations', 143575.00, 'إجمالي تبرعات شهر سبتمبر 2024', '2024-09-30', v_msila_branch, v_admin_id),
    ('expense', 'admin_expenses', 17050.00, 'تصليح وصيانة حواسيب الجمعية', '2024-09-14', v_msila_branch, v_admin_id),
    ('expense', 'humanitarian', 95000.00, 'شراء مدفأة (حملة الشتاء)', '2024-09-17', v_msila_branch, v_admin_id),
    ('expense', 'educational', 29005.00, 'اقتناء أدوات مدرسية (الدخول المدرسي)', '2024-09-19', v_msila_branch, v_admin_id);

    -- [OCTOBER 2024]
    INSERT INTO transactions (transaction_type, category, amount, description, transaction_date, branch_id, created_by)
    VALUES 
    ('income', 'donations', 52020.00, 'إجمالي تبرعات شهر أكتوبر 2024', '2024-10-31', v_msila_branch, v_admin_id),
    ('expense', 'social_aid', 30500.00, 'اقتناء مواد غذائية - أكتوبر', '2024-10-27', v_msila_branch, v_admin_id);

    -- [DECEMBER 2024]
    INSERT INTO transactions (transaction_type, category, amount, description, transaction_date, branch_id, created_by)
    VALUES 
    ('income', 'donations', 217770.00, 'إجمالي تبرعات شهر ديسمبر 2024', '2024-12-31', v_msila_branch, v_admin_id),
    ('expense', 'admin_expenses', 1700.00, 'لوازم صيانة المقر', '2024-12-25', v_msila_branch, v_admin_id),
    ('expense', 'educational', 6300.00, 'لوازم مدرسية', '2024-12-22', v_msila_branch, v_admin_id),
    ('expense', 'admin_expenses', 8600.00, 'لافتات وملصقات الجمعية', '2024-12-26', v_msila_branch, v_admin_id),
    ('expense', 'educational', 185624.00, 'أدوات مدرسية (كمية كبرى)', '2024-12-30', v_msila_branch, v_admin_id);

    -- [JANUARY 2025]
    INSERT INTO transactions (transaction_type, category, amount, description, transaction_date, branch_id, created_by)
    VALUES 
    ('income', 'donations', 112546.00, 'إجمالي تبرعات جانفي 2025', '2025-01-31', v_msila_branch, v_admin_id),
    ('expense', 'social_aid', 50000.00, 'توزيع أظرفة مالية مساعدات', '2025-01-11', v_msila_branch, v_admin_id),
    ('expense', 'medical', 2000.00, 'تصليح نظارة طبية لمستفيد', '2025-01-15', v_msila_branch, v_admin_id),
    ('expense', 'medical', 27000.00, 'تكاليف أشعة طبية (راديو)', '2025-01-21', v_msila_branch, v_admin_id);

    -- [FEBRUARY 2025]
    INSERT INTO transactions (transaction_type, category, amount, description, transaction_date, branch_id, created_by)
    VALUES 
    ('income', 'donations', 196746.00, 'إجمالي تبرعات فيفري 2025', '2025-02-28', v_msila_branch, v_admin_id),
    ('expense', 'medical', 35750.00, 'تكاليف أشعة وتحاليل طبية', '2025-02-15', v_msila_branch, v_admin_id),
    ('expense', 'social_aid', 80000.00, 'توزيع أظرفة مالية مساعدات', '2025-02-22', v_msila_branch, v_admin_id),
    ('expense', 'social_aid', 19200.00, 'اقتناء مواد غذائية', '2025-02-22', v_msila_branch, v_admin_id),
    ('expense', 'medical', 2700.00, 'تكاليف خياطة جرح ( surgery)', '2025-02-22', v_msila_branch, v_admin_id),
    ('expense', 'social_aid', 20000.00, 'كفالة شهرية لعائلات', '2025-02-28', v_msila_branch, v_admin_id);

    -- [MARCH 2025]
    INSERT INTO transactions (transaction_type, category, amount, description, transaction_date, branch_id, created_by)
    VALUES 
    ('income', 'donations', 132596.00, 'إجمالي تبرعات مارس 2025', '2025-03-31', v_msila_branch, v_admin_id),
    ('expense', 'medical', 800.00, 'تحاليل طبية', '2025-03-10', v_msila_branch, v_admin_id),
    ('expense', 'social_aid', 72000.00, 'توزيع أظرفة مالية مساعدات', '2025-03-25', v_msila_branch, v_admin_id),
    ('expense', 'social_aid', 20000.00, 'كفالة شهرية لعائلات', '2025-03-29', v_msila_branch, v_admin_id),
    ('expense', 'admin_expenses', 2064.00, 'صيانة دورية للمقر', '2025-03-29', v_msila_branch, v_admin_id);

    -- [APRIL 2025]
    INSERT INTO transactions (transaction_type, category, amount, description, transaction_date, branch_id, created_by)
    VALUES 
    ('income', 'donations', 114232.00, 'إجمالي تبرعات أفريل 2025', '2025-04-30', v_msila_branch, v_admin_id),
    ('expense', 'admin_expenses', 33352.94, 'صيانة وترميم المقر', '2025-04-12', v_msila_branch, v_admin_id),
    ('expense', 'medical', 21000.00, 'تكاليف أشعة طبية', '2025-04-22', v_msila_branch, v_admin_id),
    ('expense', 'social_aid', 20000.00, 'كفالة شهرية لعائلات', '2025-04-24', v_msila_branch, v_admin_id);

    -- [MAY 2025]
    INSERT INTO transactions (transaction_type, category, amount, description, transaction_date, branch_id, created_by)
    VALUES 
    ('income', 'donations', 90379.06, 'إجمالي تبرعات ماي 2025', '2025-05-31', v_msila_branch, v_admin_id),
    ('expense', 'medical', 1225.00, 'تحاليل طبية لمستفيدين', '2025-05-21', v_msila_branch, v_admin_id),
    ('expense', 'social_aid', 19800.00, 'اقتناء مواد غذائية وتوزيعها', '2025-05-23', v_msila_branch, v_admin_id),
    ('expense', 'social_aid', 20000.00, 'كفالة شهرية لعائلات', '2025-05-25', v_msila_branch, v_admin_id);

    -- [JUNE 2025]
    INSERT INTO transactions (transaction_type, category, amount, description, transaction_date, branch_id, created_by)
    VALUES 
    ('income', 'donations', 94854.06, 'إجمالي تبرعات جوان 2025', '2025-06-30', v_msila_branch, v_admin_id),
    ('expense', 'medical', 1000.00, 'تحاليل طبية', '2025-06-21', v_msila_branch, v_admin_id),
    ('expense', 'social_aid', 22400.00, 'مواد غذائية دورية', '2025-06-24', v_msila_branch, v_admin_id),
    ('expense', 'medical', 18750.00, 'تكاليف أشعة (راديو)', '2025-06-28', v_msila_branch, v_admin_id);

    -- [JULY 2025]
    INSERT INTO transactions (transaction_type, category, amount, description, transaction_date, branch_id, created_by)
    VALUES 
    ('income', 'donations', 171704.06, 'إجمالي تبرعات جويلية 2025', '2025-07-31', v_msila_branch, v_admin_id),
    ('expense', 'medical', 85900.00, 'تكاليف فحوصات وأشعة طبية مكثفة', '2025-07-14', v_msila_branch, v_admin_id),
    ('expense', 'social_aid', 4000.00, 'اقتناء مياه معدنية', '2025-07-16', v_msila_branch, v_admin_id);

    -- [AUGUST 2025]
    INSERT INTO transactions (transaction_type, category, amount, description, transaction_date, branch_id, created_by)
    VALUES 
    ('income', 'donations', 217770.00, 'إجمالي تبرعات أوت 2025', '2025-08-31', v_msila_branch, v_admin_id),
    ('expense', 'social_aid', 30500.00, 'اقتناء مواد غذائية - أوت', '2025-08-28', v_msila_branch, v_admin_id),
    ('expense', 'educational', 185624.00, 'تجهيز الأدوات المدرسية للموسم الجديد', '2025-08-30', v_msila_branch, v_admin_id);

    RAISE NOTICE 'Official Archive Loaded Successfully. Dashboard Statistics updated.';
END $$;
