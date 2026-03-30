-- Benefit receipts table
CREATE TABLE IF NOT EXISTS benefit_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Receipt identity
  receipt_number VARCHAR(30) UNIQUE NOT NULL,
  -- Format: GH-YEAR-BRANCH-XXXX
  -- Example: GH-2026-MSL-0047

  receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  fiscal_year INTEGER NOT NULL,

  -- Family info (snapshot at time of receipt)
  family_id UUID REFERENCES families(id),
  beneficiary_full_name VARCHAR(200) NOT NULL,
  beneficiary_national_id VARCHAR(20),
  beneficiary_phone VARCHAR(20),
  beneficiary_address TEXT,
  beneficiary_municipality VARCHAR(100),
  family_members_count INTEGER,
  family_category VARCHAR(30),
  -- widow | disabled | chronic_illness | orphan | poor_family

  -- Benefit details
  benefit_type VARCHAR(30) NOT NULL,
  -- ramadan_basket | eid_gift | school_supplies |
  -- medical | financial_aid | food_basket | clothing | other
  benefit_description TEXT NOT NULL,
  -- Full Arabic description of what was given

  -- Financial value
  benefit_value DECIMAL(12,2) NOT NULL,
  -- القيمة المالية للاستفادة
  benefit_value_in_words TEXT NOT NULL,
  -- القيمة بالحروف: مثال "خمسة آلاف دينار جزائري"
  currency VARCHAR(10) DEFAULT 'دج',

  -- Inkind items (if not financial)
  inkind_items JSONB DEFAULT '[]',
  -- [{ name: "زيت", quantity: 2, unit: "لتر", unit_price: 500 }]
  inkind_total_value DECIMAL(12,2),

  -- Linked occasion
  occasion_id UUID REFERENCES occasions(id),
  occasion_title VARCHAR(300),

  -- Branch info (snapshot)
  branch_id UUID REFERENCES branches(id),
  branch_name VARCHAR(200),
  wilaya VARCHAR(50) DEFAULT 'ولاية المسيلة',

  -- Signatories (snapshot of names at time of signing)
  president_name VARCHAR(150),
  -- رئيس المكتب الولائي أو البلدي
  treasurer_name VARCHAR(150),
  -- أمين المال

  -- Signing status
  president_signed BOOLEAN DEFAULT false,
  treasurer_signed BOOLEAN DEFAULT false,
  beneficiary_signed BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  fully_signed_at TIMESTAMPTZ,

  -- Digital fingerprint placeholder
  -- (physical fingerprint on printed doc)
  beneficiary_signature_note TEXT DEFAULT
    'بصمة وتوقيع المستفيد على النسخة الورقية',

  -- PDF
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,

  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
    'draft',          -- منشأة لم تُطبع بعد
    'printed',        -- طُبعت في انتظار التوقيع
    'signed',         -- موقعة من الجميع
    'delivered',      -- سُلِّمت للمستفيد
    'cancelled'       -- ملغاة
  )),
  cancellation_reason TEXT,

  -- Audit
  created_by UUID REFERENCES user_profiles(id),
  printed_by UUID REFERENCES user_profiles(id),
  printed_at TIMESTAMPTZ,
  delivered_by UUID REFERENCES user_profiles(id),
  delivered_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number(
  p_year INTEGER,
  p_branch_code VARCHAR
) RETURNS VARCHAR AS $$
DECLARE
  v_count INTEGER;
  v_number VARCHAR;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count
  FROM benefit_receipts
  WHERE fiscal_year = p_year;

  v_number := 'GH-' || p_year || '-'
    || p_branch_code || '-'
    || LPAD(v_count::TEXT, 4, '0');

  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE benefit_receipts ENABLE ROW LEVEL SECURITY;

-- Top 3: see all receipts
-- branch_president: see own branch receipts
-- board_member: see receipts (no financial value shown)
--   → handled in frontend, not RLS
DROP POLICY IF EXISTS "receipts_access" ON benefit_receipts;
CREATE POLICY "receipts_access" ON benefit_receipts
  FOR SELECT USING (
    CASE get_my_role()
      WHEN 'president'       THEN true
      WHEN 'vice_president'  THEN true
      WHEN 'treasurer'       THEN true
      WHEN 'board_member'    THEN true
      WHEN 'branch_president'
        THEN branch_id = get_my_branch()
      ELSE false
    END
    AND is_deleted = false
  );

DROP POLICY IF EXISTS "receipts_insert" ON benefit_receipts;
CREATE POLICY "receipts_insert" ON benefit_receipts
  FOR INSERT WITH CHECK (
    get_my_role() IN (
      'president','vice_president','treasurer',
      'board_member','branch_president'
    )
  );

DROP POLICY IF EXISTS "receipts_update" ON benefit_receipts;
CREATE POLICY "receipts_update" ON benefit_receipts
  FOR UPDATE USING (
    CASE get_my_role()
      WHEN 'president'       THEN true
      WHEN 'vice_president'  THEN true
      WHEN 'treasurer'       THEN true
      WHEN 'board_member'    THEN true
      WHEN 'branch_president'
        THEN branch_id = get_my_branch()
      ELSE false
    END
  );
