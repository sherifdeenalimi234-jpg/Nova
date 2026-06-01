-- FIX MISSING PROJECT_MEMBERS TABLE
-- This migration ensures the project_members table exists and has correct RLS policies.

-- 1. Create Project Members Table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'Contributor',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(project_id, user_id)
);

-- 2. Apply Role Constraints
ALTER TABLE public.project_members DROP CONSTRAINT IF EXISTS project_members_role_check;
ALTER TABLE public.project_members ADD CONSTRAINT project_members_role_check CHECK (role IN ('Owner', 'Researcher', 'Developer', 'Designer', 'Contributor'));

-- 3. Enable RLS
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES

-- SELECT: Members can see their own memberships, or owners of the project can see all members
DROP POLICY IF EXISTS "Members can view their project memberships." ON public.project_members;
CREATE POLICY "Members can view their project memberships."
ON public.project_members FOR SELECT
USING (
    auth.uid() = user_id
    OR
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id AND p.creator_id = auth.uid()
    )
    OR
    public.is_admin()
);

-- ALL: Owner of the project can manage members
DROP POLICY IF EXISTS "Owners can manage project members." ON public.project_members;
CREATE POLICY "Owners can manage project members."
ON public.project_members FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id AND p.creator_id = auth.uid()
    )
    OR
    public.is_admin()
);

-- INSERT: Allow insertion when creating a project
DROP POLICY IF EXISTS "Project creators can add themselves as members." ON public.project_members;
CREATE POLICY "Project creators can add themselves as members."
ON public.project_members FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id AND p.creator_id = auth.uid()
    )
    OR
    public.is_admin()
);
