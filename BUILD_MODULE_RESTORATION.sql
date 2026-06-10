-- ==========================================
-- BUILD MODULE DATABASE RESTORATION SCRIPT
-- ==========================================
-- This script reconstructs the full relational schema for the Survey Build Module,
-- ensures server action compatibility, and fixes namespace collisions.

-- 1. SURVEY_RESPONSES SCHEMA ALIGNMENT
-- Renames columns to match lib/actions/surveys.ts expectations
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

-- 2. SURVEYS TABLE NAMESPACE FIX
-- Renames the JSONB 'questions' column to 'legacy_questions' to avoid collision with joins
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'questions') THEN
        ALTER TABLE public.surveys RENAME COLUMN questions TO legacy_questions;
    END IF;

    -- Ensure legacy_questions is nullable
    ALTER TABLE public.surveys ALTER COLUMN legacy_questions DROP NOT NULL;

    -- Ensure surveys can be created in 'draft' status by default
    ALTER TABLE public.surveys ALTER COLUMN status SET DEFAULT 'draft';
END $$;

-- 3. SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.survey_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.survey_sections(id) ON DELETE SET NULL,
    type TEXT NOT NULL DEFAULT 'short_text',
    title TEXT NOT NULL DEFAULT '',
    description TEXT,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    order_index INTEGER NOT NULL DEFAULT 0,
    placeholder TEXT,
    validation_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. OPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.survey_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL DEFAULT '',
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. LOGIC RULES TABLE
CREATE TABLE IF NOT EXISTS public.survey_logic_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    source_question_id UUID NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- e.g., 'jump_to', 'hide_question', 'end_survey'
    condition_type TEXT NOT NULL, -- e.g., 'answer_is', 'answer_is_not', 'always'
    condition_value JSONB,
    target_id UUID, -- Can be section_id or question_id depending on action
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_survey_sections_survey_id ON public.survey_sections(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON public.survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_section_id ON public.survey_questions(section_id);
CREATE INDEX IF NOT EXISTS idx_survey_options_question_id ON public.survey_options(question_id);
CREATE INDEX IF NOT EXISTS idx_survey_logic_rules_survey_id ON public.survey_logic_rules(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_logic_rules_source_question_id ON public.survey_logic_rules(source_question_id);

-- 8. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.survey_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_logic_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- 9. OWNERSHIP SECURITY (RLS POLICIES)

-- Helper function for ownership checks
CREATE OR REPLACE FUNCTION public.is_survey_owner(s_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.surveys
    WHERE id = s_id AND creator_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for survey_sections
DROP POLICY IF EXISTS "Creators can manage their sections" ON public.survey_sections;
CREATE POLICY "Creators can manage their sections" ON public.survey_sections
    FOR ALL USING (public.is_survey_owner(survey_id));

-- Policies for survey_questions
DROP POLICY IF EXISTS "Creators can manage their questions" ON public.survey_questions;
CREATE POLICY "Creators can manage their questions" ON public.survey_questions
    FOR ALL USING (public.is_survey_owner(survey_id));

-- Policies for survey_options
DROP POLICY IF EXISTS "Creators can manage their options" ON public.survey_options;
CREATE POLICY "Creators can manage their options" ON public.survey_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.survey_questions
            WHERE id = survey_options.question_id
            AND public.is_survey_owner(survey_id)
        )
    );

-- Policies for survey_logic_rules
DROP POLICY IF EXISTS "Creators can manage their logic rules" ON public.survey_logic_rules;
CREATE POLICY "Creators can manage their logic rules" ON public.survey_logic_rules
    FOR ALL USING (public.is_survey_owner(survey_id));

-- Policies for survey_responses
DROP POLICY IF EXISTS "Users can view own survey responses" ON public.survey_responses;
CREATE POLICY "Users can view own survey responses" ON public.survey_responses
    FOR SELECT USING (auth.uid() = participant_id);

DROP POLICY IF EXISTS "Users can insert own survey responses" ON public.survey_responses;
CREATE POLICY "Users can insert own survey responses" ON public.survey_responses
    FOR INSERT WITH CHECK (auth.uid() = participant_id);

DROP POLICY IF EXISTS "Creators can view responses to their surveys" ON public.survey_responses;
CREATE POLICY "Creators can view responses to their surveys" ON public.survey_responses
  FOR SELECT USING (public.is_survey_owner(survey_id));

-- 10. UPDATED_AT AUTOMATION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t_name TEXT;
BEGIN
    FOR t_name IN SELECT unnest(ARRAY['survey_sections', 'survey_questions', 'survey_options', 'survey_logic_rules'])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_%I_updated_at ON public.%I', t_name, t_name);
        EXECUTE format('CREATE TRIGGER set_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()', t_name, t_name);
    END LOOP;
END $$;

-- 11. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
