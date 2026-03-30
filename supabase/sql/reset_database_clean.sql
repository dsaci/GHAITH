-- ═══════════════════════════════════════════════════════════════════
-- RESET DATABASE (ROBUST VERSION) — PRESERVE REAL DATA
-- ═══════════════════════════════════════════════════════════════════

DO $$ 
BEGIN
    -- 1. Disable triggers
    SET session_replication_role = 'replica';

    -- 2. Truncate Financial Transactions (Only if tables exist)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions') THEN
        TRUNCATE TABLE transactions RESTART IDENTITY CASCADE;
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'family_benefits') THEN
        TRUNCATE TABLE family_benefits RESTART IDENTITY CASCADE;
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'receipts') THEN
        TRUNCATE TABLE receipts RESTART IDENTITY CASCADE;
    END IF;

    -- 3. Truncate Activities/Occasions (To be replaced by 2024 Archive)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'occasions') THEN
        TRUNCATE TABLE occasions RESTART IDENTITY CASCADE;
    END IF;

    -- 4. Truncate Portal Notifications/Requests
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'portal_requests') THEN
        TRUNCATE TABLE portal_requests RESTART IDENTITY CASCADE;
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        TRUNCATE TABLE notifications RESTART IDENTITY CASCADE;
    END IF;

    -- 5. Re-enable triggers
    SET session_replication_role = 'origin';

    RAISE NOTICE 'Database reset successfully. Families and Members are preserved.';
END $$;
