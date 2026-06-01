-- PROJECTS SCHEMA SYNC: Final synchronization of the projects table with the codebase requirements.
-- Ensures all referenced columns exist and legacy data is migrated.

DO $$
BEGIN
    -- 1. Ensure all columns exist with correct types
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS short_description TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS full_description TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Draft';
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'Public';
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS cover_image TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS banner_image TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'Live Project';
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    -- 2. Data Migration for Deprecated Fields (Safe idempotent updates)
    UPDATE public.projects
    SET full_description = description
    WHERE full_description IS NULL AND description IS NOT NULL;

    UPDATE public.projects
    SET cover_image = thumbnail_url
    WHERE cover_image IS NULL AND thumbnail_url IS NOT NULL;

    -- 3. Apply Constraints
    ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;
    ALTER TABLE public.projects ADD CONSTRAINT projects_status_check CHECK (status IN ('Draft', 'Active', 'On Hold', 'Completed', 'Archived'));

    ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_visibility_check;
    ALTER TABLE public.projects ADD CONSTRAINT projects_visibility_check CHECK (visibility IN ('Public', 'Team Only', 'Private'));

    ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_type_check;
    ALTER TABLE public.projects ADD CONSTRAINT projects_type_check CHECK (project_type IN ('Live Project', 'Showcase Project'));

    -- 4. Setup Updated_At Trigger
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_projects_updated_at') THEN
        CREATE TRIGGER set_projects_updated_at
            BEFORE UPDATE ON public.projects
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Migration encountered an error: %', SQLERRM;
END $$;
