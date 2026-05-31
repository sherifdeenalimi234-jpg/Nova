-- Migration: Add project_type to projects and update constraints for Phase 1
DO $$
BEGIN
    -- Add project_type column
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'project_type') THEN
        ALTER TABLE public.projects ADD COLUMN project_type TEXT DEFAULT 'Live Project';
    END IF;

    -- Add constraint for project_type
    ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_type_check;
    ALTER TABLE public.projects ADD CONSTRAINT projects_type_check CHECK (project_type IN ('Live Project', 'Showcase Project'));

    -- Update visibility check to be simpler if needed, but keeping Team Only doesn't hurt.
    -- However, Phase 1 specifically mentions Public and Private.
    -- We will keep the existing one as it's more comprehensive.

EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
