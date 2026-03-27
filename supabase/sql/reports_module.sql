-- Run in Supabase SQL Editor (existing project). Adjust RLS policies to match your auth.

CREATE TABLE IF NOT EXISTS report_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('literary','financial')),
  reminder_date DATE NOT NULL,
  period VARCHAR(20) CHECK (period IN ('monthly','quarterly','annual')),
  target_roles TEXT[] DEFAULT ARRAY['president','vice_president','treasurer'],
  message TEXT,
  is_sent BOOLEAN DEFAULT false,
  is_acknowledged BOOLEAN DEFAULT false,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('literary','financial')),
  report_year INTEGER NOT NULL,
  title VARCHAR(300) NOT NULL,
  data JSONB NOT NULL,
  pdf_url TEXT,
  docx_url TEXT,
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft','final','submitted')),
  created_by UUID,
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: link to user_profiles when that table exists
-- ALTER TABLE saved_reports ADD CONSTRAINT saved_reports_created_by_fkey FOREIGN KEY (created_by) REFERENCES user_profiles(id);
-- ALTER TABLE saved_reports ADD CONSTRAINT saved_reports_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES user_profiles(id);

ALTER TABLE documents ADD COLUMN IF NOT EXISTS report_year INTEGER;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_type VARCHAR(80);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT,
  year INTEGER,
  target_roles TEXT[] DEFAULT ARRAY['president','vice_president','treasurer'],
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_reminders_year ON report_reminders(year);
CREATE INDEX IF NOT EXISTS idx_saved_reports_type_year ON saved_reports(report_type, report_year);
-- If you have a transactions table:
-- CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
