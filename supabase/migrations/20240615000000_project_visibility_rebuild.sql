-- PROJECT VISIBILITY REBUILD: Binary Visibility and Auto-Approval
-- This migration simplifies project visibility to Public/Private and removes proactive approval requirements for posts.

BEGIN;

-- 1. Simplify Project Visibility
-- Update existing 'Team Only' projects to 'Private'
UPDATE public.projects SET visibility = 'Private' WHERE visibility = 'Team Only';

-- Update visibility check constraint
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_visibility_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_visibility_check CHECK (visibility IN ('Public', 'Private'));

-- 2. Remove Post Approval Requirements
-- Update existing 'pending' posts to 'approved'
UPDATE public.posts SET status = 'approved' WHERE status = 'pending';

-- Change default status for future posts
ALTER TABLE public.posts ALTER COLUMN status SET DEFAULT 'approved';

-- 3. Update RLS Policies for Projects
-- Ensure Public projects are viewable by everyone, regardless of status (unless Archived logic is handled elsewhere)
DROP POLICY IF EXISTS "Projects visibility policy" ON public.projects;
CREATE POLICY "Projects visibility policy"
ON public.projects FOR SELECT
USING (
    visibility = 'Public'
    OR creator_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_id = public.projects.id AND user_id = auth.uid()
    )
);

-- 4. Update RLS Policies for Posts
-- Since status now defaults to approved, public read policy remains valid but we should ensure creators can insert approved posts.
DROP POLICY IF EXISTS "Approved posts are viewable by everyone." ON public.posts;
CREATE POLICY "Approved posts are viewable by everyone."
ON public.posts FOR SELECT
USING (status = 'approved');

DROP POLICY IF EXISTS "Creators can insert posts." ON public.posts;
CREATE POLICY "Creators can insert posts."
ON public.posts FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_verified_creator = true OR is_admin = true))
);

-- Authors should be able to update their own posts regardless of status (for moderation/editing)
DROP POLICY IF EXISTS "Authors can update pending posts." ON public.posts;
CREATE POLICY "Authors can update own posts."
ON public.posts FOR UPDATE
USING (auth.uid() = author_id);

-- 5. Audit Record
INSERT INTO public.activity_feed (user_id, action, entity_id, entity_type)
SELECT id, 'SYSTEM MIGRATION: VISIBILITY REBUILD', id, 'system'
FROM public.profiles
WHERE is_admin = true
LIMIT 1;

COMMIT;

-- ROLLBACK INSTRUCTIONS:
-- 1. Change posts.status default back to 'pending'.
-- 2. Restore projects_visibility_check to include 'Team Only'.
-- 3. Revert RLS policies to include status = 'pending' checks for authors.
-- 4. Note: Data migration for 'Team Only' -> 'Private' is irreversible without a backup or manual tracking.
