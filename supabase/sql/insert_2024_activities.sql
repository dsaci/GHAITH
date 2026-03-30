-- ═══════════════════════════════════════════════════════════════════
-- INSERT 2024 LITERARY REPORT — OFFICIAL ARCHIVE
-- ═══════════════════════════════════════════════════════════════════

-- 1. Helper to find current admin user ID (president usually)
DO $$
DECLARE
    v_admin_id UUID := (SELECT id FROM user_profiles WHERE role = 'president' LIMIT 1);
    v_msila_branch UUID := (SELECT id FROM branches WHERE branch_name LIKE '%المسيلة%' LIMIT 1);
BEGIN

    -- A. Educational Support (June)
    INSERT INTO occasions (title, occasion_type, sub_type, description, start_date, end_date, status, branch_id, created_by)
    VALUES 
    ('دعم تلاميذ شهادة التعليم المتوسط BEM 2024', 'educational', 'امتحانات', 'تقديم الدعم المعنوي وتوزيع المياه المعدنية على التلاميذ', '2024-06-03', '2024-06-05', 'completed', v_msila_branch, v_admin_id),
    ('دعم تلاميذ شهادة البكالوريا BAC 2024', 'educational', 'امتحانات', 'تقديم الدعم المعنوي وتوزيع المياه المعدنية على التلاميذ', '2024-06-09', '2024-06-13', 'completed', v_msila_branch, v_admin_id);

    -- B. Weekly Summer Activities (June - August)
    INSERT INTO occasions (title, occasion_type, sub_type, description, start_date, status, is_recurring, recurrence_pattern, branch_id, created_by)
    VALUES 
    ('سقيا عابري السبيل (أسبوعي - كل جمعة)', 'humanitarian', 'سقيا', 'توزيع المياه المعدنية على عابري السبيل بمعدل 150-200 قارورة كل جمعة', '2024-06-14', 'completed', true, 'custom', v_msila_branch, v_admin_id);

    -- C. Food Distribution (June - October)
    INSERT INTO occasions (title, occasion_type, sub_type, description, start_date, status, is_recurring, recurrence_pattern, branch_id, created_by)
    VALUES 
    ('توزيع الخضر والفواكه (أسبوعي - كل سبت)', 'humanitarian', 'دعم غذائي', 'توزيع ما بين 20 إلى 28 قفة أسبوعياً لضمان الأمن الغذائي للعائلات الهشة', '2024-06-01', 'completed', true, 'custom', v_msila_branch, v_admin_id);

    -- D. Monthly Distributions (June, July, August)
    INSERT INTO occasions (title, occasion_type, sub_type, description, start_date, status, branch_id, created_by)
    VALUES 
    ('توزيع مواد غذائية وألبسة - جوان 2024', 'social', 'توزيع دوري', 'توزيع مواد غذائية وألبسة مستعملة وجديدة لفائدة العائلات المسجلة', '2024-06-28', 'completed', v_msila_branch, v_admin_id),
    ('توزيع مواد غذائية وألبسة - جويلية 2024', 'social', 'توزيع دوري', 'توزيع مواد غذائية وألبسة مستعملة وجديدة لفائدة العائلات المسجلة', '2024-07-29', 'completed', v_msila_branch, v_admin_id),
    ('توزيع مواد غذائية وألبسة - أوت 2024', 'social', 'توزيع دوري', 'توزيع مواد غذائية وألبسة مستعملة وجديدة لفائدة العائلات المسجلة', '2024-08-26', 'completed', v_msila_branch, v_admin_id);

    -- E. School Season (September)
    INSERT INTO occasions (title, occasion_type, sub_type, description, start_date, status, branch_id, created_by, target_beneficiaries_count)
    VALUES 
    ('مبادرة الحقيبة المدرسية - العودة للدراسة', 'humanitarian', 'دخول مدرسي', 'توزيع 245 محفظة بلوازمها و180 محفظة دون لوازمها لفائدة أطفال العائلات المسجلة', '2024-09-15', 'completed', v_msila_branch, v_admin_id, 425);

    -- F. Solidarity Caravans (October)
    INSERT INTO occasions (title, occasion_type, sub_type, description, start_date, status, branch_id, created_by)
    VALUES 
    ('قافلة خرمام التضامنية', 'humanitarian', 'قافلة', 'بالتنسيق مع كافل اليتيم: توزيع 40 محفظة و30 قفة غذائية وألبسة', '2024-10-20', 'completed', v_msila_branch, v_admin_id);

    -- G. Winter Season (November - December)
    INSERT INTO occasions (title, occasion_type, sub_type, description, start_date, status, branch_id, created_by)
    VALUES 
    ('توزيع قفف غذائية وألبسة - نوفمبر 2024', 'social', 'توزيع دوري', 'إعانات دورية لفائدة العائلات المسجلة', '2024-11-02', 'completed', v_msila_branch, v_admin_id),
    ('مبادرة وجبات العشاء الساخنة (الشتاء)', 'humanitarian', 'إطعام خيري', 'توزيع وجبات عشاء ساخنة لفائدة مفترشي الطرقات وعابري السبيل في الشتاء', '2024-12-05', 'completed', v_msila_branch, v_admin_id),
    ('توزيع ملابس شتوية للأطفال', 'humanitarian', 'كسوة شتاء', 'توزيع ملابس وألبسة للوقاية من البرد لفائدة الأطفال', '2024-12-10', 'completed', v_msila_branch, v_admin_id),
    ('قافلة غيث الكبرى - بلدية بن سرور', 'humanitarian', 'قافلة كبرى', 'قافلة طبية وعينية شاملة تشمل فحوصات طبية وتوزيع أدوية ومساعدات عينية ومدافئ', '2024-12-20', 'completed', v_msila_branch, v_admin_id);

END $$;
