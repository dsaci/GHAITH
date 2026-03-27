-- Activities & Archive module — run in Supabase SQL Editor

ALTER TABLE occasions ADD COLUMN IF NOT EXISTS sub_type VARCHAR(100);
ALTER TABLE occasions ADD COLUMN IF NOT EXISTS partners TEXT;
ALTER TABLE occasions ADD COLUMN IF NOT EXISTS actual_beneficiaries_count INTEGER DEFAULT 0;
ALTER TABLE occasions ADD COLUMN IF NOT EXISTS post_report TEXT;
ALTER TABLE occasions ADD COLUMN IF NOT EXISTS photos_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE occasions ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE occasions ADD COLUMN IF NOT EXISTS recurrence_pattern VARCHAR(20)
  CHECK (recurrence_pattern IS NULL OR recurrence_pattern IN ('annual','monthly','custom'));
ALTER TABLE occasions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE occasions ADD COLUMN IF NOT EXISTS municipality_name VARCHAR(200);
ALTER TABLE occasions ADD COLUMN IF NOT EXISTS responsible_member_id UUID;
ALTER TABLE occasions ADD COLUMN IF NOT EXISTS document_urls JSONB DEFAULT '[]'::jsonb;

-- Optional: align with app (if columns use snake_case only)
-- family_benefits.occasion_id should exist for linking

INSERT INTO occasions
  (title, occasion_type, sub_type, start_date, status,
   is_recurring, recurrence_pattern, description)
VALUES
  ('توزيع سلال رمضان الغذائية','religious','رمضان',
   '2026-02-28','planned',true,'annual',
   'توزيع السلال الغذائية على الأسر المحتاجة خلال شهر رمضان المبارك'),

  ('مساعدات عيد الفطر','religious','عيد الفطر',
   '2026-03-29','planned',true,'annual',
   'تقديم مساعدات العيد للأسر المسجلة (ملابس وحلويات)'),

  ('مساعدات عيد الأضحى','religious','عيد الأضحى',
   '2026-06-06','planned',true,'annual',
   'توزيع لحوم الأضاحي على الأسر المحتاجة'),

  ('دعم الدخول المدرسي','educational','الدخول المدرسي',
   '2026-09-05','planned',true,'annual',
   'توزيع الحقائب والأدوات المدرسية على أطفال الأسر المسجلة'),

  ('إحياء يوم الشهيد','national','يوم الشهيد',
   '2026-02-18','planned',true,'annual',
   'إحياء ذكرى يوم الشهيد بفعاليات وطنية وتربوية'),

  ('إحياء يوم العلم','national','يوم العلم',
   '2026-04-16','planned',true,'annual',
   'فعاليات يوم العلم وتكريم المتفوقين من أبناء الأسر المستفيدة'),

  ('حملة التبرع بالدم','humanitarian','تبرع بالدم',
   '2026-06-14','planned',true,'annual',
   'حملة للتبرع بالدم بالتنسيق مع المستشفى العمومي بالمسيلة'),

  ('دعم أصحاب الأمراض المزمنة','humanitarian','مرضى مزمنون',
   '2026-04-07','planned',true,'annual',
   'زيارات ميدانية وتقديم مساعدات طبية لأصحاب الأمراض المزمنة'),

  ('فعاليات عيد الاستقلال','national','عيد الاستقلال',
   '2026-07-05','planned',true,'annual',
   'مشاركة في الفعاليات الرسمية وتنظيم نشاطات وطنية تربوية');
