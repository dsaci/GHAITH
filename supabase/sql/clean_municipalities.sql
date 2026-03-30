-- ── CLEANUP DUPLICATE MUNICIPALITIES ───────────────────────────────
-- This script removes duplicates from the 'municipalities' table
-- while preserving data integrity by updating foreign keys.

DO $$
DECLARE
    m_record RECORD;
    target_id UUID;
BEGIN
    -- Loop through sets of duplicates (same name and daira)
    FOR m_record IN (
        SELECT name, daira, COUNT(*) 
        FROM municipalities 
        GROUP BY name, daira 
        HAVING COUNT(*) > 1
    ) LOOP
        -- Pick any ID from the duplicates (e.g., the first one)
        SELECT id INTO target_id 
        FROM municipalities 
        WHERE name = m_record.name AND daira = m_record.daira
        LIMIT 1;

        -- Update references in all tables that point to the duplicates we are about to delete
        
        -- 1. Branches
        UPDATE branches SET municipality_id = target_id 
        WHERE municipality_id IN (
            SELECT id FROM municipalities 
            WHERE name = m_record.name AND daira = m_record.daira AND id != target_id
        );

        -- 2. Families
        UPDATE families SET municipality_id = target_id 
        WHERE municipality_id IN (
            SELECT id FROM municipalities 
            WHERE name = m_record.name AND daira = m_record.daira AND id != target_id
        );

        -- 3. Members
        UPDATE members SET municipality_id = target_id 
        WHERE municipality_id IN (
            SELECT id FROM municipalities 
            WHERE name = m_record.name AND daira = m_record.daira AND id != target_id
        );

        -- 4. External Users
        UPDATE external_users SET municipality_id = target_id 
        WHERE municipality_id IN (
            SELECT id FROM municipalities 
            WHERE name = m_record.name AND daira = m_record.daira AND id != target_id
        );

        -- 5. Donors (Internal CRM)
        UPDATE donors SET municipality_id = target_id 
        WHERE municipality_id IN (
            SELECT id FROM municipalities 
            WHERE name = m_record.name AND daira = m_record.daira AND id != target_id
        );

        -- Now delete the duplicate records
        DELETE FROM municipalities 
        WHERE name = m_record.name AND daira = m_record.daira AND id != target_id;
        
        RAISE NOTICE 'Cleaned up duplicates for municipality: % (%)', m_record.name, m_record.daira;
    END LOOP;
END $$;
