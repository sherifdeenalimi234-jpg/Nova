# Project Creation Fix: Missing `project_members` Table

The application was failing because the `public.project_members` table did not exist in the Supabase database. This table is essential for tracking project ownership and team memberships, which are required by the project creation flow.

## 1. Issue Description
When a user attempts to create a project, the system first inserts a record into the `projects` table and then immediately attempts to insert the creator as an 'Owner' in the `project_members` table. If the latter fails (e.g., because the table doesn't exist), the project creation flow fails.

## 2. Required SQL Migration
The following SQL script should be executed in your Supabase SQL Editor to resolve the issue. It will:
1. Create the `project_members` table if it doesn't exist.
2. Add necessary foreign key constraints to `projects` and `profiles` tables.
3. Apply role constraints for project members.
4. Enable Row-Level Security (RLS) and set up non-recursive policies for viewing and managing memberships.

```sql
-- FIX MISSING PROJECT_MEMBERS TABLE

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
```

## 3. How to Apply
1. Go to your [Supabase Dashboard](https://app.supabase.com/).
2. Select your project.
3. Click on the **SQL Editor** in the left sidebar.
4. Click **New Query**.
5. Paste the SQL code above.
6. Click **Run**.

## 4. Verification
After applying the migration, you can verify that the table exists and the project creation flow works as expected:
1. Navigate to the "Create Project" page in the application.
2. Fill in the project details and submit.
3. The project should be created successfully, and you should be automatically added as the 'Owner' in the project team.
