-- Rollback SQL for Survey Blueprint refactor

ALTER TABLE public.surveys DROP COLUMN IF EXISTS project_id;
ALTER TABLE public.surveys DROP COLUMN IF EXISTS target_audience;
ALTER TABLE public.surveys DROP COLUMN IF EXISTS target_responses;
ALTER TABLE public.surveys DROP COLUMN IF EXISTS estimated_duration;
ALTER TABLE public.surveys DROP COLUMN IF EXISTS visibility;
ALTER TABLE public.surveys DROP COLUMN IF EXISTS anonymous_responses;
ALTER TABLE public.surveys DROP COLUMN IF EXISTS collect_identity;
ALTER TABLE public.surveys DROP COLUMN IF EXISTS advanced_settings;

DROP POLICY IF EXISTS "Creators have full control over their surveys" ON public.surveys;
DROP INDEX IF EXISTS idx_surveys_creator;
DROP INDEX IF EXISTS idx_surveys_project;
