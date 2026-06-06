-- SURVEY SYSTEM DATABASE CORRECTION
-- Goal: Ensure schema alignment with codebase and fix namespace conflicts.

-- 1. Correct Survey Responses Table (Code alignment)
DO $$
BEGIN
    -- Rename user_id to participant_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'survey_responses' AND column_name = 'user_id') THEN
        ALTER TABLE public.survey_responses RENAME COLUMN user_id TO participant_id;
    END IF;

    -- Rename answers to responses
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'survey_responses' AND column_name = 'answers') THEN
        ALTER TABLE public.survey_responses RENAME COLUMN answers TO responses;
    END IF;
END $$;

-- 2. Resolve Namespace Collision in Surveys Table
-- The JSONB 'questions' column conflicts with the 'questions' join alias for the survey_questions table.
-- We rename the JSONB column to 'metadata_questions' to preserve legacy data while allowing the join.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'questions') THEN
        ALTER TABLE public.surveys RENAME COLUMN questions TO legacy_questions;
    END IF;

    -- Ensure legacy_questions is nullable now that we use normalized tables
    ALTER TABLE public.surveys ALTER COLUMN legacy_questions DROP NOT NULL;
END $$;

-- 3. Verify Constraints and RLS
-- Ensure surveys can be created in 'draft' status by default
ALTER TABLE public.surveys ALTER COLUMN status SET DEFAULT 'draft';

-- Update RLS for survey_responses to match participant_id rename
DROP POLICY IF EXISTS "Users can view own survey responses" ON public.survey_responses;
CREATE POLICY "Users can view own survey responses" ON public.survey_responses
    FOR SELECT USING (auth.uid() = participant_id);

-- 4. Storage Buckets (Ensure existence)
INSERT INTO storage.buckets (id, name, public)
VALUES ('surveys', 'surveys', true)
ON CONFLICT (id) DO NOTHING;
