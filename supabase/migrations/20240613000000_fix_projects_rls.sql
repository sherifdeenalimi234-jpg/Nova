-- FIX PROJECTS RLS POLICIES
-- Resolves "PROJECT NOT FOUND" issue by ensuring creators can always view their own projects
-- and fixing recursive policies in project_members.

-- 1. Projects Table Policies
DROP POLICY IF EXISTS "Projects are viewable by public or members." ON public.projects;

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

-- 2. Project Members Table Policies
DROP POLICY IF EXISTS "Members can view their project memberships." ON public.project_members;
DROP POLICY IF EXISTS "Owners can manage project members." ON public.project_members;

-- Simplified SELECT policy to avoid recursion
CREATE POLICY "View project memberships"
ON public.project_members FOR SELECT
USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
        -- Check if the current user is the owner of the project this membership belongs to
        -- Use a direct join on projects table which has its own non-recursive RLS
        SELECT 1 FROM public.projects p
        WHERE p.id = public.project_members.project_id AND p.creator_id = auth.uid()
    )
);

-- Manage members policy
CREATE POLICY "Manage project memberships"
ON public.project_members FOR ALL
USING (
    public.is_admin()
    OR EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = public.project_members.project_id AND p.creator_id = auth.uid()
    )
);
