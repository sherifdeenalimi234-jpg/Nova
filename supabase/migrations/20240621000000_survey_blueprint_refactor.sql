-- Migration: Survey Blueprint Schema Refactor
-- Adds support for project linking, target audience, and enhanced configuration.

-- 1. Add new columns to surveys
ALTER TABLE public.surveys
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS target_audience TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_responses INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'Private';

-- 2. Add constraint for visibility
ALTER TABLE public.surveys DROP CONSTRAINT IF EXISTS surveys_visibility_check;
ALTER TABLE public.surveys ADD CONSTRAINT surveys_visibility_check CHECK (visibility IN ('Private', 'Organization', 'Public'));

-- 3. Update settings defaults
-- Note: We use a merge-friendly approach if possible, but for a new blueprint we want these keys available.
UPDATE public.surveys
SET settings = settings || '{"collect_identity": false, "auto_close": false, "response_limit": 0, "allow_multiple_submissions": false, "language": "en", "timezone": "UTC"}'::jsonb
WHERE settings IS NOT NULL;

ALTER TABLE public.surveys
ALTER COLUMN settings SET DEFAULT '{"anonymous": true, "one_response_per_participant": true, "collect_identity": false, "auto_close": false, "response_limit": 0, "allow_multiple_submissions": false, "language": "en", "timezone": "UTC"}'::jsonb;

-- 4. Ensure foreign key index for performance
CREATE INDEX IF NOT EXISTS idx_surveys_project_id ON public.surveys(project_id);

-- 5. Add RLS policy for project-linked surveys
-- If a survey is linked to a project, project members might need access depending on future requirements.
-- For now, we stick to the creator-only or published-only policy, but ensure it works with the new columns.
