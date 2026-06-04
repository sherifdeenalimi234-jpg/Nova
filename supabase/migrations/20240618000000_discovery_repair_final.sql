-- DISCOVERY SYSTEM REPAIR: Final Security & Pipeline Hardening
-- This migration resolves the RLS mismatch and silent failures preventing project discovery posts.

BEGIN;

-- 1. Align Post RLS with Project RLS
-- Allows creators to insert discovery posts if they meet any verification criteria.
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

-- 2. Ensure Public Visibility for Discovery Signals
DROP POLICY IF EXISTS "Approved posts are viewable by everyone." ON public.posts;
CREATE POLICY "Approved posts are viewable by everyone."
ON public.posts FOR SELECT
USING (status = 'approved');

-- 3. Fix Activity Feed Visibility
-- Activity feed was missing a SELECT policy despite RLS being enabled.
DROP POLICY IF EXISTS "Public activity feed is readable by everyone." ON public.activity_feed;
CREATE POLICY "Public activity feed is readable by everyone."
ON public.activity_feed FOR SELECT
USING (true);

-- 4. Normalize Content States
-- Ensures all content adheres to the reactive moderation model (default approved).
ALTER TABLE public.posts ALTER COLUMN status SET DEFAULT 'approved';
UPDATE public.posts SET status = 'approved' WHERE status != 'approved';

-- 5. Support Project Type Discovery
-- Ensures the 'project' type is valid in the posts table.
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_post_type_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_post_type_check
CHECK (post_type IN ('research', 'project', 'innovation', 'achievement', 'publication', 'ai_visual', 'collaboration_request', 'survey'));

-- 6. Membership Integrity Repair
-- Ensures creators always have access to their projects in the Hub.
INSERT INTO public.project_members (project_id, user_id, role)
SELECT id, creator_id, 'Owner'
FROM public.projects p
WHERE NOT EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = p.id AND pm.user_id = p.creator_id
)
ON CONFLICT DO NOTHING;

-- 7. Logging Migration
INSERT INTO public.activity_feed (user_id, action, entity_id, entity_type)
SELECT id, 'SYSTEM MIGRATION: DISCOVERY REPAIR COMPLETED', id, 'system'
FROM public.profiles
WHERE is_admin = true
LIMIT 1;

COMMIT;

-- ROLLBACK:
-- 1. Restore strict 'is_verified_creator' only check in posts RLS.
-- 2. Revert posts.status default to 'pending'.
-- 3. Drop activity_feed SELECT policy.
