-- PHASE 1: Project Foundation System Migration

-- 1. Update Projects Table
DO $$
BEGIN
    -- Add new columns if they don't exist
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS short_description TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS full_description TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Draft';
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'Public';
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS cover_image TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS banner_image TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    -- Migration: copy existing description to full_description if full_description is null
    UPDATE public.projects SET full_description = description WHERE full_description IS NULL AND description IS NOT NULL;

    -- Migration: copy existing thumbnail_url to cover_image if cover_image is null
    UPDATE public.projects SET cover_image = thumbnail_url WHERE cover_image IS NULL AND thumbnail_url IS NOT NULL;

    -- Constraints
    ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;
    ALTER TABLE public.projects ADD CONSTRAINT projects_status_check CHECK (status IN ('Draft', 'Active', 'On Hold', 'Completed', 'Archived'));

    ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_visibility_check;
    ALTER TABLE public.projects ADD CONSTRAINT projects_visibility_check CHECK (visibility IN ('Public', 'Team Only', 'Private'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. Create Project Members Table
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'Contributor',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(project_id, user_id)
);

-- Constraints for project_members role
DO $$
BEGIN
    ALTER TABLE public.project_members DROP CONSTRAINT IF EXISTS project_members_role_check;
    ALTER TABLE public.project_members ADD CONSTRAINT project_members_role_check CHECK (role IN ('Owner', 'Researcher', 'Developer', 'Designer', 'Contributor'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. RLS POLICIES
-- 4. Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('projects', 'projects', true)
ON CONFLICT (id) DO NOTHING;

-- 5. RLS POLICIES

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if any
DROP POLICY IF EXISTS "Public projects are viewable by everyone." ON public.projects;
DROP POLICY IF EXISTS "Projects are viewable by public or members." ON public.projects;
DROP POLICY IF EXISTS "Creators can create projects." ON public.projects;
DROP POLICY IF EXISTS "Owners can update own projects." ON public.projects;
DROP POLICY IF EXISTS "Owners can delete own projects." ON public.projects;

-- Projects SELECT: Public or Member
CREATE POLICY "Projects are viewable by public or members."
ON public.projects FOR SELECT
USING (
    visibility = 'Public'
    OR
    EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_id = public.projects.id AND user_id = auth.uid()
    )
    OR
    public.is_admin()
);

-- Projects INSERT: Only verified creators
CREATE POLICY "Creators can create projects."
ON public.projects FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (is_verified_creator = true OR is_admin = true)
    )
);

-- Projects UPDATE: Owner only
CREATE POLICY "Owners can update own projects."
ON public.projects FOR UPDATE
USING (
    creator_id = auth.uid() OR public.is_admin()
);

-- Projects DELETE: Owner only
CREATE POLICY "Owners can delete own projects."
ON public.projects FOR DELETE
USING (
    creator_id = auth.uid() OR public.is_admin()
);

-- Project Members RLS
DROP POLICY IF EXISTS "Members can view their project memberships." ON public.project_members;
DROP POLICY IF EXISTS "Owners can manage project members." ON public.project_members;

-- SELECT: Members of the same project can see each other, or owner, or admin
CREATE POLICY "Members can view their project memberships."
ON public.project_members FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.project_members pm
        WHERE pm.project_id = public.project_members.project_id AND pm.user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = public.project_members.project_id AND p.creator_id = auth.uid()
    )
    OR
    public.is_admin()
);

-- ALL: Owner of the project can manage members
CREATE POLICY "Owners can manage project members."
ON public.project_members FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = public.project_members.project_id AND p.creator_id = auth.uid()
    )
    OR
    public.is_admin()
);
