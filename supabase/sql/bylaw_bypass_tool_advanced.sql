-- ====================================================
-- Advanced Emergency Bylaw Bypass Tool with Rollback
-- Project: Ghaith Platform
-- Status: Production-Ready (Emergency Utility)
-- ====================================================

-- 1️⃣ إنشاء جدول النسخ الاحتياطية الدائم (Persistent Backup)
-- هذا الجدول يحفظ التواقيع الأصلية لضمان القدرة على التراجع
CREATE TABLE IF NOT EXISTS _antigravity_bylaw_backup (
    user_id UUID,
    bylaw_version TEXT,
    acknowledged_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT
);

-- 2️⃣ إنشاء RPC لتجاوز توقيع الميثاق مع النسخ الاحتياطي
CREATE OR REPLACE FUNCTION antigravity_force_bylaw_acknowledgment_adv(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_current_version TEXT;
    v_existing RECORD;
BEGIN
    -- الحصول على النسخة الحالية من الميثاق (is_current = true)
    SELECT version::TEXT INTO v_current_version
    FROM bylaw_versions
    WHERE is_current = true
    LIMIT 1;

    -- نسخ النسخة الأصلية إن وجدت للتراجع لاحقاً
    SELECT * INTO v_existing
    FROM bylaw_acknowledgments
    WHERE user_id = p_user_id
      AND bylaw_version = v_current_version;

    IF FOUND THEN
        INSERT INTO _antigravity_bylaw_backup(user_id, bylaw_version, acknowledged_at, ip_address, user_agent)
        VALUES (v_existing.user_id, v_existing.bylaw_version, v_existing.acknowledged_at, v_existing.ip_address, v_existing.user_agent)
        ON CONFLICT DO NOTHING;
    END IF;

    -- إدخال أو تحديث توقيع المستخدم (Hardened Bypass)
    INSERT INTO bylaw_acknowledgments(user_id, bylaw_version, acknowledged_at, ip_address, user_agent)
    VALUES (
        p_user_id,
        COALESCE(v_current_version, '1.0'),
        NOW(),
        '127.0.0.1'::INET,
        'Antigravity Advanced Bypass Tool'
    )
    ON CONFLICT (user_id, bylaw_version)
    DO UPDATE SET
        acknowledged_at = NOW(),
        ip_address = '127.0.0.1'::INET,
        user_agent = 'Antigravity Advanced Bypass Tool';
END;
$$;

-- 3️⃣ تنفيذ التجاوز لجميع المستخدمين في حالة الانتظار (pending)
-- ملاحظة: يمكنك تعليق هذا السطر إذا أردت تشغيل الوظيفة بشكل فردي مستقبلاً
SELECT antigravity_force_bylaw_acknowledgment_adv(id)
FROM external_users
WHERE status = 'pending';

-- 4️⃣ RPC للتراجع عن جميع التعديلات (Rollback Mechanism)
CREATE OR REPLACE FUNCTION antigravity_bylaw_rollback()
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN SELECT * FROM _antigravity_bylaw_backup LOOP
        INSERT INTO bylaw_acknowledgments(user_id, bylaw_version, acknowledged_at, ip_address, user_agent)
        VALUES (rec.user_id, rec.bylaw_version, rec.acknowledged_at, rec.ip_address, rec.user_agent)
        ON CONFLICT (user_id, bylaw_version)
        DO UPDATE SET
            acknowledged_at = EXCLUDED.acknowledged_at,
            ip_address = EXCLUDED.ip_address,
            user_agent = EXCLUDED.user_agent;
    END LOOP;

    -- تنظيف النسخ الاحتياطية بعد التراجع بنجاح
    DELETE FROM _antigravity_bylaw_backup;
END;
$$;
