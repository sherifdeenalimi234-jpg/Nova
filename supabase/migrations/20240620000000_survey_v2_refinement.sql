-- SURVEY SYSTEM V2 SCHEMA REFINEMENT

-- Add settings columns to surveys
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
    "anonymous": false,
    "one_response_per_person": true,
    "allow_multiple_responses": false,
    "require_login": true,
    "estimated_time": 5
}'::jsonb;

ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Refine question types
ALTER TABLE public.survey_questions DROP CONSTRAINT IF EXISTS survey_questions_type_check;
ALTER TABLE public.survey_questions ADD CONSTRAINT survey_questions_type_check
CHECK (type IN ('short_text', 'long_text', 'single_choice', 'multiple_choice', 'dropdown', 'rating', 'file'));

-- Add description to questions
ALTER TABLE public.survey_questions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.survey_questions ADD COLUMN IF NOT EXISTS placeholder TEXT;
ALTER TABLE public.survey_questions ADD COLUMN IF NOT EXISTS validation_rules JSONB DEFAULT '{}'::jsonb;
