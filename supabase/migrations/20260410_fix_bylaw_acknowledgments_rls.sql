-- Migration: Fix RLS policies for bylaw_acknowledgments
-- Date: 2026-04-10
-- Issue: 42501 - Row-level security violation on INSERT
-- Status: APPLIED directly in Supabase (this file is for documentation/reproducibility)

-- تنظيف policies القديمة
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'bylaw_acknowledgments'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.bylaw_acknowledgments', r.policyname);
    END LOOP;
END $$;

-- تفعيل RLS
ALTER TABLE public.bylaw_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Policy 1: المستخدمون يدرجون موافقاتهم فقط
CREATE POLICY "users_insert_own_acknowledgment"
ON public.bylaw_acknowledgments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 2: المستخدمون يقرأون موافقاتهم فقط
CREATE POLICY "users_read_own_acknowledgment"
ON public.bylaw_acknowledgments FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Policy 3: الإداريون يقرأون كل الموافقات
CREATE POLICY "admins_read_all_acknowledgments"
ON public.bylaw_acknowledgments FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('president','vice_president','admin','treasurer','secretary')
    )
);
