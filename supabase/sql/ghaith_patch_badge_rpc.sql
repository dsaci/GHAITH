-- ═══════════════════════════════════════════════════════════════════
-- GHAITH PLATFORM — PATCH: update_volunteer_badge RPC
-- الهدف: نقل updateBadge من direct REST إلى SECURITY DEFINER RPC
-- يُشغَّل بعد ghaith_safe_migration.sql
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_volunteer_badge(p_volunteer_id UUID)
RETURNS JSON AS $$
DECLARE
  v_hours   NUMERIC := 0;
  v_badge   TEXT    := 'new';
BEGIN
  -- جلب إجمالي الساعات
  SELECT COALESCE(total_hours, 0) INTO v_hours
  FROM volunteers
  WHERE id = p_volunteer_id;

  -- تحديد مستوى الشارة
  IF    v_hours >= 200 THEN v_badge := 'champion';
  ELSIF v_hours >= 100 THEN v_badge := 'gold';
  ELSIF v_hours >= 50  THEN v_badge := 'silver';
  ELSIF v_hours >= 10  THEN v_badge := 'bronze';
  ELSE                      v_badge := 'new';
  END IF;

  -- التحديث عبر SECURITY DEFINER — يتجاوز RLS
  UPDATE volunteers
  SET badge_level = v_badge
  WHERE id = p_volunteer_id;

  RETURN json_build_object(
    'success',      true,
    'volunteer_id', p_volunteer_id,
    'badge_level',  v_badge,
    'total_hours',  v_hours
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
