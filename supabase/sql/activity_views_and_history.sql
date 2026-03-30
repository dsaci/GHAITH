-- 1. Create a view for Recent Activities (Dashboard Feed)
-- This view aggregates changes from families, members, and transactions
DROP VIEW IF EXISTS recent_activities CASCADE;
DROP TABLE IF EXISTS recent_activities CASCADE;
CREATE OR REPLACE VIEW recent_activities AS
(
  SELECT 
    id::text, 
    'تم إضافة عائلة جديدة: ' || family_name as description, 
    'create' as action_type, 
    'family' as resource_type, 
    created_at 
  FROM families 
  WHERE is_deleted = false
)
UNION ALL
(
  SELECT 
    id::text, 
    'انضمام عضو جديد: ' || full_name as description, 
    'create' as action_type, 
    'member' as resource_type, 
    created_at 
  FROM members 
  WHERE status = 'active'
)
UNION ALL
(
  SELECT 
    id::text, 
    CASE WHEN transaction_type = 'income' THEN 'مدخول جديد: ' ELSE 'مصروف جديد: ' END || description as description,
    'create' as action_type,
    'finance' as resource_type,
    created_at
  FROM transactions
  WHERE is_deleted = false
)
ORDER BY created_at DESC;

-- 2. 2024 Archive Migration
-- Mark all activities (occasions) from 2024 as archived/completed if not already
UPDATE occasions 
SET status = 'completed' 
WHERE start_date >= '2024-01-01' AND start_date <= '2024-12-31'
AND status != 'completed';

-- Optional: Add a property to occasions to explicitly mark them as "archived"
ALTER TABLE occasions ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
UPDATE occasions SET is_archived = true WHERE start_date < '2025-01-01';

-- 3. Automated Tracking (Simple Trigger to log generic changes)
-- This is a placeholder for more advanced auditing if needed
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT,
    record_id TEXT,
    action TEXT,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
