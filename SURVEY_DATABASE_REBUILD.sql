-- SURVEY_DATABASE_REBUILD.sql
-- Migration to rebuild Survey Initialization Layer

-- 1. Add/Update columns to public.surveys
-- Using ALTER TABLE to ensure columns exist with the correct type for the new Blueprint system.

-- Survey Name is already stored in 'title'
-- Research Objective
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS research_objective TEXT;

-- Linked Project
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- Target Audience
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='target_audience') THEN
        ALTER TABLE public.surveys ALTER COLUMN target_audience TYPE TEXT USING target_audience::text;
    ELSE
        ALTER TABLE public.surveys ADD COLUMN target_audience TEXT;
    END IF;
END $$;

-- Target Responses
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='target_responses') THEN
        ALTER TABLE public.surveys ALTER COLUMN target_responses TYPE TEXT USING target_responses::text;
    ELSE
        ALTER TABLE public.surveys ADD COLUMN target_responses TEXT;
    END IF;
END $$;

-- Visibility
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'Private';
ALTER TABLE public.surveys DROP CONSTRAINT IF EXISTS surveys_visibility_check;
ALTER TABLE public.surveys ADD CONSTRAINT surveys_visibility_check CHECK (visibility IN ('Private', 'Public', 'Invite Only'));

-- Estimated Duration
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS estimated_duration TEXT;

-- 2. Obsolete Column Cleanup
COMMENT ON COLUMN public.surveys.questions IS 'DEPRECATED: Use survey_questions table instead.';

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_surveys_project_id ON public.surveys(project_id);
CREATE INDEX IF NOT EXISTS idx_surveys_creator_id ON public.surveys(creator_id);

-- 4. RLS Policy Refinement
DROP POLICY IF EXISTS "Creators can manage their own surveys" ON public.surveys;
CREATE POLICY "Creators can manage their own surveys" ON public.surveys
    FOR ALL USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Anyone can view public surveys" ON public.surveys;
CREATE POLICY "Anyone can view public surveys" ON public.surveys
    FOR SELECT USING (visibility = 'Public' AND status = 'published');
