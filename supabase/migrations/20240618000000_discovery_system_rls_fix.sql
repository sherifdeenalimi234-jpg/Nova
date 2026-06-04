-- DISCOVERY SYSTEM RLS FIX
-- Adds missing policies for activity_feed and ensures posts insertion is hardened and secure.

BEGIN;

-- 1. Activity Feed Policies
-- Allow users to view activity feed (needed for the Ecosystem Feed)
DROP POLICY IF EXISTS "Activity feed is public" ON public.activity_feed;
CREATE POLICY "Activity feed is public"
ON public.activity_feed FOR SELECT
USING (true);

-- Allow authenticated users to insert their own activity
DROP POLICY IF EXISTS "Users can insert own activity" ON public.activity_feed;
CREATE POLICY "Users can insert own activity"
ON public.activity_feed FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 2. Harden Posts Insertion Policy
-- Ensuring all verification flags are covered to prevent RLS failures during discovery post creation.
-- Security: Added ownership check (auth.uid() = author_id) to prevent unauthorized post creation.
DROP POLICY IF EXISTS "Creators can insert posts." ON public.posts;
CREATE POLICY "Creators can insert posts."
ON public.posts FOR INSERT
WITH CHECK (
  (auth.uid() = author_id OR public.is_admin())
  AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (
      is_verified_creator = true
      OR is_admin = true
      OR creator_verified = true
      OR creator_status = 'approved'
      OR verification_status = 'approved'
    )
  )
);

-- 3. Audit entry
INSERT INTO public.activity_feed (user_id, action, entity_id, entity_type)
SELECT id, 'SYSTEM MIGRATION: DISCOVERY RLS FIX', id, 'system'
FROM public.profiles
WHERE is_admin = true
LIMIT 1;

COMMIT;
