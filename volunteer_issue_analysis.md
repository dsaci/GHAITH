# تقرير تحليل مشكلة RPC الخاصة بالمتطوعين (Volunteer Issue Analysis)

بناءً على الفحص الشامل لملفات المشروع، إليك التقرير المفصل حول المشكلة المتعلقة بتسجيل المتطوعين وفشل الـ RPCs المتعلقة بالبوابة:

## 1. قائمة ملفات SQL في المشروع
تم العثور على 31 ملف SQL في مجلد `supabase/sql`، تشمل أبرزها:
- `ghaith_phase1_schema.sql` (يحتوي على الهيكل الأساسي للبيانات)
- `production_hardening.sql` (يحتوي على أهم الـ RPCs وعمليات تأمين الجداول)
- `portal_ext_rpc.sql`
- `ghaith_phase2_rls.sql`
- وملفات أخرى تتعلق بالبيانات المؤقتة، المشتريات، والترقيات (Migrations).

---

## 2. استخراج الدوال (Functions/Procedures)
فيما يلي الدوال المعنية بتسجيل المتطوعين والبيانات المرتبطة بها (تم العثور عليها في `production_hardening.sql` و `portal_ext_rpc.sql`):

### دالة `submit_public_volunteer` 
**الموقع:** `production_hardening.sql`
**الوظيفة:** تسجيل متطوع جديد من البوابة العامة للحصول على حساب خارجي `external_user` وثم ملف `volunteer`.
**المتغيرات المستعملة:**
```sql
  p_full_name TEXT,
  p_phone TEXT,
  p_birth_date DATE,
  p_birth_place TEXT,
  p_municipality_name TEXT,
  p_occupation TEXT,
  p_specialization TEXT,
  p_education_level TEXT,
  p_reason TEXT
```

### دالة `get_pending_registrations_v2`
**الموقع:** `production_hardening.sql`
**الوظيفة:** جلب الطلبات المعلقة للإداريين ليتم مراجعتها من لوحة التحكم.

---

## 3. تحليل ملفات JavaScript/TypeScript (الواجهة الأمامية)

### أ. ملف `src/services/admin.portal.service.ts`
يحتوي على الدوال التي تتصل بقاعدة البيانات عبر الـ RPCs أعلاه:
- `submitPublicVolunteerRequest(form)` : تمرر بيانات الاستمارة (الاسم، الهاتف، تاريخ الميلاد، البلدية...) إلى `rpc('submit_public_volunteer')`.
- `fetchPendingRegistrations()`: تستدعي `rpc('get_pending_registrations_v2')`.

### ب. ملف `src/pages/Landing/VolunteerPage.tsx` 
(كود استمارة المتطوع):
يحتوي على واجهة إدخال بيانات المتطوع (Form). يتم تجميع الحقول من المستخدم واستدعاء `submitPublicVolunteerRequest` الموضحة أعلاه. يتم التحقق وتنبيه المستخدم بشكل مناسب في حال فشل الإرسال.

### ج. ملف `src/services/portal/volunteer.service.ts`
يحتوي على دوال للتحقق من هوية المتطوع الداخلي وجلب ملفه الشخصي وإحصائياته مثل `getMyProfile` و `getMyStats`.

---

## 4. هياكل الجداول المتعلقة (Schema Extraction)
بمراجعة `ghaith_phase1_schema.sql`، هذه بعض الهياكل الأصلية للجداول الأساسية:

### جدول `municipalities` 
يحتوي على قائمة البلديات. `id`, `name`, `daira`, `wilaya`, `code`

### جدول `external_users` 
يخزن المستخدمين الخارجيين من البوابة:
`id`, `auth_id`, `portal_type`, `full_name`, `phone`, `email`, `national_id`, `address`, `municipality_id`, `birth_date`, `gender`, `profile_photo_url`, `status`, `rejection_reason`

### جدول `volunteers` 
يخزن البيانات الإضافية للمتطوع (مرتبط بـ external_users):
`id`, `external_user_id`, `volunteer_number`, `education_level`, `profession`, `skills`, `availability`, `areas_of_interest`, `has_vehicle`

---

## 5. التشخيص وخلاصة التقرير (طبيعة مشكلة الـ RPC)

تبين أن هناك **عدم توافق (Schema Mismatch)** بين دوال الـ RPC المعرفة في `production_hardening.sql` والهيكل الأصلي المعتمد في `ghaith_phase1_schema.sql`.

**المشاكل التي تم رصدها والمسببة لفشل RPC:**
1. **أعمدة مفقودة:** 
   - الـ RPC يمرر متغيراً باسم `p_specialization` لكن العمود غير موجود في جدول `volunteers`.
   - الـ RPC `get_pending_registrations_v2` يعتمد على `social_media` و `birth_place` وهما غير موجودين في `external_users`.
2. **قيود التسلسل الفريد (Unique constraints & Sequences):**
   - الـ RPC `submit_public_volunteer` يستعمل تعليمة `ON CONFLICT (external_user_id)` ولكن الحد الأقصى `UNIQUE` مفقود من العمود.
   - نفس الأمر ينطبق على التحقق باستخدام `ON CONFLICT (phone)`.
   - الرقم المرجعي للمتطوع لا يُولّد آلياً بسبب غياب التسلسل (Sequence) `volunteer_number_seq`.

**الحل:**
ملف الهجرة `ghaith_safe_migration.sql` الذي أرفقته هو **الحل الفعال والدقيق** لمعالجة هذه الثغرات دون كسر أي شيء في النظام. يعالج هذا الملف جميع الأعمدة المفقودة ويصحح الدوال بالكامل.

تم حفظ سكريبت الإصلاح في نظام الملفات تحت المسار:
`c:\Users\Surface\Desktop\abdennour_saci\مشاريع\Ghaith\supabase\sql\ghaith_safe_migration.sql`
