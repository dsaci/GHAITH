-- ═══════════════════════════════════════════════════════════════════
-- COMPREHENSIVE CLEANUP & BRANCH ORGANIZATION — GHAYTH PLATFORM
-- ═══════════════════════════════════════════════════════════════════

DO $$ 
DECLARE
    v_admin_id UUID := (SELECT id FROM user_profiles WHERE role = 'president' LIMIT 1);
    v_msila_mun UUID := (SELECT id FROM municipalities WHERE name = 'المسيلة' LIMIT 1);
    v_hadjel_mun UUID := (SELECT id FROM municipalities WHERE name = 'عين الحجل' LIMIT 1);
    v_srour_mun UUID := (SELECT id FROM municipalities WHERE name = 'بن سرور' LIMIT 1);
    v_derradj_mun UUID := (SELECT id FROM municipalities WHERE name = 'أولاد دراج' LIMIT 1);
    
    v_hadjel_branch_id UUID;
    v_ghaith_branch_id UUID;
    v_srour_branch_id UUID;
    v_derradj_branch_id UUID;
BEGIN
    SET session_replication_role = 'replica';

    -- 1. TRUNCATE EXPERIMENTAL DATA TABLES
    TRUNCATE TABLE mail_registry CASCADE;
    TRUNCATE TABLE meetings CASCADE;
    TRUNCATE TABLE inventory CASCADE;
    TRUNCATE TABLE inventory_movements CASCADE;
    TRUNCATE TABLE documents CASCADE;
    TRUNCATE TABLE saved_reports CASCADE;
    TRUNCATE TABLE external_users CASCADE;
    TRUNCATE TABLE volunteers CASCADE;
    TRUNCATE TABLE volunteer_logs CASCADE;
    TRUNCATE TABLE donor_profiles CASCADE;
    TRUNCATE TABLE beneficiary_portal CASCADE;
    TRUNCATE TABLE donors CASCADE;
    TRUNCATE TABLE honor_wall CASCADE;
    TRUNCATE TABLE notifications CASCADE;
    -- Note: families and transactions were cleaned in the previous archive script.

    -- 2. RESET BRANCHES (Delete non-standard)
    DELETE FROM branches WHERE branch_name NOT IN ('المكتب الولائي - المسيلة'); -- Keep core if exists

    -- 3. INSERT OFFICIAL BRANCHES
    -- Branch 1: عين الحجل (Active)
    INSERT INTO branches (branch_name, municipality_id, is_active, established_date)
    VALUES ('فرع عين الحجل', v_hadjel_mun, true, '2024-04-01')
    RETURNING id INTO v_hadjel_branch_id;

    -- Branch 2: فرع المكتب البلدي (Inactive - Saci Abdennour)
    INSERT INTO branches (branch_name, municipality_id, is_active, established_date)
    VALUES ('فرع المكتب البلدي', v_msila_mun, false, '2024-04-01')
    RETURNING id INTO v_ghaith_branch_id;

    -- Branch 3: فرع بن سرور (Inactive - Hadeel)
    INSERT INTO branches (branch_name, municipality_id, is_active, established_date)
    VALUES ('فرع بن سرور', v_srour_mun, false, '2024-04-01')
    RETURNING id INTO v_srour_branch_id;

    -- Branch 4: فرع أولاد دراج (Inactive)
    INSERT INTO branches (branch_name, municipality_id, is_active, established_date)
    VALUES ('فرع أولاد دراج', v_derradj_mun, false, '2024-04-01')
    RETURNING id INTO v_derradj_branch_id;

    -- 4. UPDATE USER PROFILES (Assign leadership where known)
    -- President/Admin stays at Wilaya level, but we can assign branches to others if they exist.
    UPDATE user_profiles SET branch_id = v_ghaith_branch_id WHERE id = v_admin_id;

    SET session_replication_role = 'origin';

    RAISE NOTICE 'Branches Organized: Hadjel, Ghaith, Ben Srour, Derradj. All test data cleared.';
END $$;
