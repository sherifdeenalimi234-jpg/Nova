-- POST CREATION AND DISCOVERY HARDENING
-- Fixes issues where discovery posts are not being generated due to RLS or status mismatches.

BEGIN;

-- 1. Ensure 'project' type is allowed in posts table
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_post_type_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_post_type_check
CHECK (post_type IN ('research', 'project', 'innovation', 'achievement', 'publication', 'ai_visual', 'collaboration_request', 'survey'));

-- 2. Ensure default status for posts is 'approved' for reactive moderation
ALTER TABLE public.posts ALTER COLUMN status SET DEFAULT 'approved';
UPDATE public.posts SET status = 'approved' WHERE status = 'pending';

-- 3. Hardened RLS Policy for Post Insertion
-- Ensures any verified creator or admin can insert discovery posts
DROP POLICY IF EXISTS "Creators can insert posts." ON public.posts;
CREATE POLICY "Creators can insert posts."
ON public.posts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (is_verified_creator = true OR is_admin = true OR creator_verified = true)
  )
);

-- 4. Policy for Public Visibility
DROP POLICY IF EXISTS "Approved posts are viewable by everyone." ON public.posts;
CREATE POLICY "Approved posts are viewable by everyone."
ON public.posts FOR SELECT
USING (status = 'approved');

-- 5. Logging Migration
INSERT INTO public.activity_feed (user_id, action, entity_id, entity_type)
SELECT id, 'SYSTEM MIGRATION: POST DISCOVERY HARDENING', id, 'system'
FROM public.profiles
WHERE is_admin = true
LIMIT 1;

COMMIT;

-- ROLLBACK:
-- 1. Revert posts.status default to 'pending'.
-- 2. Restore strict RLS without creator_verified check.
-- 3. Note: Metadata updates are irreversible.
