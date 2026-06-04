-- PROJECT VISIBILITY FINAL ENFORCEMENT
-- Ensures all projects and posts adhere to the simplified visibility model.

BEGIN;

-- 1. Metadata Normalization
UPDATE public.projects SET visibility = 'Private' WHERE visibility NOT IN ('Public', 'Private');
UPDATE public.posts SET status = 'approved' WHERE status != 'approved';

-- 2. Policy Hardening: Projects
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

-- 3. Policy Hardening: Posts
DROP POLICY IF EXISTS "Approved posts are viewable by everyone." ON public.posts;
CREATE POLICY "Approved posts are viewable by everyone."
ON public.posts FOR SELECT
USING (status = 'approved');

-- 4. Re-synchronize Project Memberships (Emergency repair for missing records)
-- This ensures that every project has at least its creator as an owner
INSERT INTO public.project_members (project_id, user_id, role)
SELECT id, creator_id, 'Owner'
FROM public.projects p
WHERE NOT EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = p.id AND pm.user_id = p.creator_id
)
ON CONFLICT DO NOTHING;

-- 5. Audit
INSERT INTO public.activity_feed (user_id, action, entity_id, entity_type)
SELECT id, 'SYSTEM MIGRATION: VISIBILITY FINAL ENFORCEMENT', id, 'system'
FROM public.profiles
WHERE is_admin = true
LIMIT 1;

COMMIT;
