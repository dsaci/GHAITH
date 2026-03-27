-- ═══════════════════════════════════════════════════════════════════
-- GHAYTH PLATFORM — PHASE 1 SCHEMA (run in Supabase SQL Editor, IN ORDER)
-- Fixed dependency order: occasions BEFORE family_benefits
-- ═══════════════════════════════════════════════════════════════════

-- ── BLOCK 1: CORE GEOGRAPHY ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS municipalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  daira VARCHAR(100),
  wilaya VARCHAR(50) DEFAULT 'المسيلة',
  code VARCHAR(10)
);

INSERT INTO municipalities (name, daira)
SELECT v.name, v.daira FROM (
  VALUES
  ('المسيلة','دائرة المسيلة'),
  ('بوسعادة','دائرة بوسعادة'),
  ('الهامل','دائرة بوسعادة'),
  ('أولتام','دائرة بوسعادة'),
  ('أولاد دراج','دائرة أولاد دراج'),
  ('أولاد عدي القبالة','دائرة أولاد دراج'),
  ('المطارفة','دائرة أولاد دراج'),
  ('المعاضيد','دائرة أولاد دراج'),
  ('صوامع','دائرة أولاد دراج'),
  ('الخبانة','دائرة الخبانة'),
  ('مسيف','دائرة الخبانة'),
  ('الحوامد','دائرة الخبانة'),
  ('الشلال','دائرة الشلال'),
  ('أولاد ماضي','دائرة الشلال'),
  ('خطوطي سد الجير','دائرة الشلال'),
  ('المعاريف','دائرة الشلال'),
  ('بن سرور','دائرة بن سرور'),
  ('أولاد سليمان','دائرة بن سرور'),
  ('الزرزور','دائرة بن سرور'),
  ('محمد بوضياف','دائرة بن سرور'),
  ('عين الملح','دائرة عين الملح'),
  ('بير فضة','دائرة عين الملح'),
  ('عين فارس','دائرة عين الملح'),
  ('تامور سيدي محمد','دائرة عين الملح'),
  ('عين الريش','دائرة عين الملح'),
  ('مجدل','دائرة امجدل'),
  ('أولاد عطية','دائرة امجدل'),
  ('جبل مسعد','دائرة جبل مسعد'),
  ('سليم','دائرة جبل مسعد'),
  ('مقرة','دائرة مقرة'),
  ('برهوم','دائرة مقرة'),
  ('عين خضرة','دائرة مقرة'),
  ('بلعايبة','دائرة مقرة'),
  ('الدهاهنة','دائرة مقرة'),
  ('سيدي عيسى','دائرة سيدي عيسى'),
  ('بوطي السايح','دائرة سيدي عيسى'),
  ('بني يلمان','دائرة سيدي عيسى'),
  ('عين الحجل','دائرة عين الحجل'),
  ('سيدي هجرس','دائرة عين الحجل'),
  ('حمام الضلعة','دائرة حمام الضلعة'),
  ('تارمونت','دائرة حمام الضلعة'),
  ('أولاد منصور','دائرة حمام الضلعة'),
  ('ونوغة','دائرة حمام الضلعة'),
  ('سيدي عامر','دائرة سيدي عامر'),
  ('تامسة','دائرة سيدي عامر'),
  ('أولاد سيدي إبراهيم','دائرة أولاد سيدي إبراهيم'),
  ('بنزوه','دائرة أولاد سيدي إبراهيم')
) AS v(name, daira)
WHERE NOT EXISTS (SELECT 1 FROM municipalities m WHERE m.name = v.name);

-- ── BLOCK 2: BRANCHES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_name VARCHAR(200) NOT NULL,
  municipality_id UUID REFERENCES municipalities(id),
  address TEXT,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  established_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BLOCK 3: INTERNAL USER PROFILES ───────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(30) NOT NULL CHECK (role IN (
    'president',
    'vice_president',
    'treasurer',
    'board_member',
    'branch_president'
  )),
  branch_id UUID REFERENCES branches(id),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BLOCK 8 (early): OCCASIONS — must exist before family_benefits ─
CREATE TABLE IF NOT EXISTS occasions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  occasion_type VARCHAR(30) CHECK (occasion_type IN (
    'national','religious','humanitarian','educational','social','other'
  )),
  sub_type VARCHAR(100),
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  location TEXT,
  target_beneficiaries_count INTEGER,
  municipality_name VARCHAR(200),
  responsible_member_id UUID,
  budget_planned DECIMAL(12,2),
  budget_actual DECIMAL(12,2),
  actual_beneficiaries_count INTEGER DEFAULT 0,
  partners TEXT,
  post_report TEXT,
  photos_urls JSONB DEFAULT '[]',
  document_urls JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN (
    'planned','in_progress','completed','cancelled'
  )),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(20) CHECK (
    recurrence_pattern IS NULL OR recurrence_pattern IN ('annual','monthly','custom')
  ),
  branch_id UUID REFERENCES branches(id),
  is_wilaya_level BOOLEAN DEFAULT true,
  created_by UUID REFERENCES user_profiles(id),
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BLOCK 4: FAMILIES & BENEFITS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number VARCHAR(20) UNIQUE NOT NULL,
  family_name VARCHAR(100) NOT NULL,
  national_id VARCHAR(20),
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  municipality_id UUID REFERENCES municipalities(id),
  branch_id UUID REFERENCES branches(id),
  category VARCHAR(30) NOT NULL CHECK (category IN (
    'widow','disabled','chronic_illness','orphan','poor_family','other'
  )),
  members_count INTEGER DEFAULT 1,
  income_level VARCHAR(20) CHECK (income_level IN ('none','very_low','low','medium')),
  monthly_income DECIMAL(10,2),
  housing_status VARCHAR(20),
  has_social_coverage BOOLEAN DEFAULT false,
  notes TEXT,
  registration_date DATE DEFAULT CURRENT_DATE,
  registered_by UUID REFERENCES user_profiles(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id),
  benefit_type VARCHAR(30) CHECK (benefit_type IN (
    'ramadan_basket','eid_gift','school_supplies',
    'medical','financial_aid','food_basket','clothing','other'
  )),
  amount DECIMAL(10,2),
  quantity INTEGER,
  description TEXT,
  benefit_date DATE NOT NULL,
  occasion_id UUID REFERENCES occasions(id),
  approved_by UUID REFERENCES user_profiles(id),
  branch_id UUID REFERENCES branches(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BLOCK 5: MEMBERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  national_id VARCHAR(20),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  address TEXT,
  municipality_id UUID REFERENCES municipalities(id),
  birth_date DATE,
  gender VARCHAR(10),
  profession VARCHAR(100),
  membership_number VARCHAR(30) UNIQUE,
  membership_date DATE NOT NULL,
  membership_type VARCHAR(20) CHECK (membership_type IN ('founder','active','supporter','honorary')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','suspended','resigned')),
  branch_id UUID REFERENCES branches(id),
  annual_fee_paid BOOLEAN DEFAULT false,
  notes TEXT,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BLOCK 6: TRANSACTIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('income','expense')),
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  reference_number VARCHAR(50),
  payment_method VARCHAR(20),
  attachment_url TEXT,
  approved_by UUID REFERENCES user_profiles(id),
  branch_id UUID REFERENCES branches(id),
  is_wilaya_level BOOLEAN DEFAULT false,
  notes TEXT,
  is_deleted BOOLEAN DEFAULT false,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BLOCK 7: ADMINISTRATIVE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mail_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mail_direction VARCHAR(10) NOT NULL CHECK (mail_direction IN ('incoming','outgoing')),
  subject VARCHAR(300) NOT NULL,
  sender_or_recipient TEXT NOT NULL,
  mail_number VARCHAR(50),
  mail_date DATE NOT NULL,
  action_status VARCHAR(20) DEFAULT 'pending',
  attachment_url TEXT,
  branch_id UUID REFERENCES branches(id),
  is_wilaya_level BOOLEAN DEFAULT false,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  meeting_type VARCHAR(20) CHECK (meeting_type IN ('board','general','emergency','committee','other')),
  meeting_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  agenda JSONB,
  attendees JSONB,
  decisions JSONB,
  minutes_url TEXT,
  status VARCHAR(20) DEFAULT 'scheduled',
  branch_id UUID REFERENCES branches(id),
  is_wilaya_level BOOLEAN DEFAULT false,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name VARCHAR(200) NOT NULL,
  item_type VARCHAR(30),
  unit VARCHAR(50) NOT NULL,
  current_quantity DECIMAL(10,2) DEFAULT 0,
  minimum_threshold DECIMAL(10,2) DEFAULT 0,
  branch_id UUID REFERENCES branches(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID REFERENCES inventory(id),
  movement_type VARCHAR(5) NOT NULL CHECK (movement_type IN ('in','out')),
  quantity DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  movement_date DATE DEFAULT CURRENT_DATE,
  recorded_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── DOCUMENTS & SAVED REPORTS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  document_type VARCHAR(50),
  file_url TEXT NOT NULL,
  file_type VARCHAR(20),
  upload_date DATE DEFAULT CURRENT_DATE,
  description TEXT,
  is_confidential BOOLEAN DEFAULT false,
  branch_id UUID REFERENCES branches(id),
  is_wilaya_level BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES user_profiles(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','approved','archived')),
  report_year INTEGER,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(20) CHECK (report_type IN ('literary','financial')),
  report_year INTEGER NOT NULL,
  title VARCHAR(300) NOT NULL,
  data JSONB NOT NULL,
  pdf_url TEXT,
  docx_url TEXT,
  branch_id UUID REFERENCES branches(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','final','submitted')),
  created_by UUID REFERENCES user_profiles(id),
  approved_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BLOCK 9: EXTERNAL PORTALS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS external_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  portal_type VARCHAR(20) NOT NULL CHECK (portal_type IN ('volunteer','donor','beneficiary')),
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  national_id VARCHAR(20),
  address TEXT,
  municipality_id UUID REFERENCES municipalities(id),
  birth_date DATE,
  gender VARCHAR(10),
  profile_photo_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','active','suspended','rejected')),
  rejection_reason TEXT,
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_user_id UUID REFERENCES external_users(id) ON DELETE CASCADE,
  volunteer_number VARCHAR(30) UNIQUE,
  education_level VARCHAR(100),
  profession VARCHAR(100),
  skills TEXT[],
  availability VARCHAR(20) CHECK (availability IN ('fulltime','parttime','weekends','occasions')),
  areas_of_interest TEXT[],
  has_vehicle BOOLEAN DEFAULT false,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  total_hours DECIMAL(8,2) DEFAULT 0,
  badge_level VARCHAR(20) DEFAULT 'new' CHECK (badge_level IN ('new','bronze','silver','gold','champion')),
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volunteer_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID REFERENCES volunteers(id),
  occasion_id UUID REFERENCES occasions(id),
  role_description TEXT,
  hours_contributed DECIMAL(5,2),
  participation_date DATE,
  confirmed_by UUID REFERENCES user_profiles(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_user_id UUID REFERENCES external_users(id) ON DELETE CASCADE,
  donor_type VARCHAR(20) DEFAULT 'individual' CHECK (donor_type IN ('individual','company','institution')),
  company_name VARCHAR(200),
  tax_number VARCHAR(50),
  preferred_donation_type VARCHAR(20) CHECK (
    preferred_donation_type IS NULL OR preferred_donation_type IN ('financial','inkind','both')
  ),
  preferred_causes TEXT[],
  communication_preference VARCHAR(20),
  is_anonymous BOOLEAN DEFAULT false,
  show_in_honor_wall BOOLEAN DEFAULT true,
  total_donated DECIMAL(12,2) DEFAULT 0,
  donations_count INTEGER DEFAULT 0,
  last_donation_date DATE,
  donor_tier VARCHAR(20) DEFAULT 'supporter' CHECK (donor_tier IN ('supporter','friend','partner','champion','patron')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS beneficiary_portal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_user_id UUID REFERENCES external_users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id),
  linked_at TIMESTAMPTZ,
  linked_by UUID REFERENCES user_profiles(id),
  can_view_benefits BOOLEAN DEFAULT true,
  can_submit_requests BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES external_users(id),
  request_type VARCHAR(30) CHECK (request_type IN (
    'financial_aid','food_aid','medical_aid','educational_aid','clothing','other'
  )),
  urgency VARCHAR(20) DEFAULT 'medium' CHECK (urgency IN ('low','medium','high','urgent')),
  description TEXT NOT NULL,
  supporting_docs JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending','under_review','approved','rejected','fulfilled'
  )),
  internal_notes TEXT,
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS honor_wall (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wall_type VARCHAR(20) CHECK (wall_type IN ('donor','volunteer')),
  external_user_id UUID REFERENCES external_users(id),
  display_name VARCHAR(200),
  display_photo_url TEXT,
  achievement_label VARCHAR(100),
  achievement_value TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  visible_on_landing BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── DONORS (internal CRM — referenced by PHASE 2 RLS) ──────────────
CREATE TABLE IF NOT EXISTS donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_type VARCHAR(20) NOT NULL DEFAULT 'individual',
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  municipality_id UUID REFERENCES municipalities(id),
  company_name VARCHAR(200),
  communication_preference VARCHAR(20) DEFAULT 'none',
  is_anonymous BOOLEAN DEFAULT false,
  notes TEXT,
  total_donated DECIMAL(12,2) DEFAULT 0,
  last_donation_date DATE,
  branch_id UUID REFERENCES branches(id),
  is_wilaya_level BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BLOCK 10: NOTIFICATIONS & AUDIT ───────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type VARCHAR(20) CHECK (recipient_type IN ('internal','volunteer','donor','beneficiary')),
  recipient_id UUID NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) CHECK (type IN (
    'welcome','approval','rejection','reminder','activity_invite',
    'request_update','thank_you','general'
  )),
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_type VARCHAR(20) CHECK (user_type IN ('internal','volunteer','donor','beneficiary')),
  action VARCHAR(20) CHECK (action IN (
    'create','read','update','delete','login','logout','export','approve','reject'
  )),
  resource_type VARCHAR(100),
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  branch_id UUID REFERENCES branches(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(20) CHECK (report_type IN ('literary','financial')),
  reminder_date DATE NOT NULL,
  target_roles TEXT[] DEFAULT ARRAY['president','vice_president','treasurer'],
  message TEXT,
  is_sent BOOLEAN DEFAULT false,
  is_acknowledged BOOLEAN DEFAULT false,
  year INTEGER NOT NULL,
  branch_id UUID REFERENCES branches(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional indexes
CREATE INDEX IF NOT EXISTS idx_families_branch ON families(branch_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_occasions_start ON occasions(start_date);
