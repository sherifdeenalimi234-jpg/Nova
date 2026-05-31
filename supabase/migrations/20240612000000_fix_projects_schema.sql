-- Corrective Migration: Ensure category and project_type columns exist and are configured correctly
DO $$
BEGIN
    -- 1. category column
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'category') THEN
        ALTER TABLE public.projects ADD COLUMN category TEXT;
    END IF;

    -- 2. project_type column
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'project_type') THEN
        ALTER TABLE public.projects ADD COLUMN project_type TEXT DEFAULT 'Live Project';
    END IF;

    -- 3. constraints
    ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_type_check;
    ALTER TABLE public.projects ADD CONSTRAINT projects_type_check CHECK (project_type IN ('Live Project', 'Showcase Project'));

    ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;
    ALTER TABLE public.projects ADD CONSTRAINT projects_status_check CHECK (status IN ('Draft', 'Active', 'On Hold', 'Completed', 'Archived'));

    ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_visibility_check;
    ALTER TABLE public.projects ADD CONSTRAINT projects_visibility_check CHECK (visibility IN ('Public', 'Team Only', 'Private'));

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in migration: %', SQLERRM;
END $$;
