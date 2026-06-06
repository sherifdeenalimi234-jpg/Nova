-- PHASE 1A: SURVEY BLUEPRINT SYSTEM V1 MIGRATION
-- This migration adds missing columns to align the surveys table with the V1 Blueprint specification.

BEGIN;

-- 1. Required Fields Alignment
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS survey_mode TEXT;

-- 2. Optional Fields Alignment
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS research_category TEXT;
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English';
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS research_timeline TEXT;
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS research_notes TEXT;
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 3. Constraints for Survey Mode
-- Options: Standard Survey, Conversational Survey, Live Survey, Offline Survey, Assessment & Quiz, Interview Mode, Research Study, Community Poll, Longitudinal Study
ALTER TABLE public.surveys DROP CONSTRAINT IF EXISTS surveys_survey_mode_check;
ALTER TABLE public.surveys ADD CONSTRAINT surveys_survey_mode_check CHECK (
    survey_mode IN (
        'Standard Survey',
        'Conversational Survey',
        'Live Survey',
        'Offline Survey',
        'Assessment & Quiz',
        'Interview Mode',
        'Research Study',
        'Community Poll',
        'Longitudinal Study'
    )
);

-- 4. Ensure target_responses is TEXT to handle "Custom" entries or large numbers consistently if needed,
-- but the spec says Type: Number. Let's stick to TEXT for flexibility as seen in current implementation
-- OR change to INTEGER if we want strictness. The current table has it as TEXT (via previous migration).
-- Given "10", "25", "50", "100", "250", "500", "1000", "Custom" in the current UI, TEXT is better.

-- 5. Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_surveys_survey_mode ON public.surveys(survey_mode);
CREATE INDEX IF NOT EXISTS idx_surveys_research_category ON public.surveys(research_category);

-- 6. RLS Update (already handled by previous migrations, but ensuring)
-- Policies usually check creator_id or visibility.

COMMIT;
