-- BUILD MODULE DATABASE RESTORATION & LOGIC ENGINE FOUNDATION
-- This script reconstructs the full relational schema for the Survey Build Module.

-- 1. SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.survey_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. QUESTIONS TABLE
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

-- 3. OPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.survey_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL DEFAULT '',
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. LOGIC RULES TABLE
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

-- 5. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_survey_sections_survey_id ON public.survey_sections(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON public.survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_section_id ON public.survey_questions(section_id);
CREATE INDEX IF NOT EXISTS idx_survey_options_question_id ON public.survey_options(question_id);
CREATE INDEX IF NOT EXISTS idx_survey_logic_rules_survey_id ON public.survey_logic_rules(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_logic_rules_source_question_id ON public.survey_logic_rules(source_question_id);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.survey_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_logic_rules ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES (OWNERSHIP BASED)

-- Helper function to check survey ownership
CREATE OR REPLACE FUNCTION public.is_survey_owner(s_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.surveys
    WHERE id = s_id AND creator_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sections
DROP POLICY IF EXISTS "Creators can manage their sections" ON public.survey_sections;
CREATE POLICY "Creators can manage their sections" ON public.survey_sections
    FOR ALL USING (public.is_survey_owner(survey_id));

-- Questions
DROP POLICY IF EXISTS "Creators can manage their questions" ON public.survey_questions;
CREATE POLICY "Creators can manage their questions" ON public.survey_questions
    FOR ALL USING (public.is_survey_owner(survey_id));

-- Options
DROP POLICY IF EXISTS "Creators can manage their options" ON public.survey_options;
CREATE POLICY "Creators can manage their options" ON public.survey_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.survey_questions
            WHERE id = survey_options.question_id
            AND public.is_survey_owner(survey_id)
        )
    );

-- Logic Rules
DROP POLICY IF EXISTS "Creators can manage their logic rules" ON public.survey_logic_rules;
CREATE POLICY "Creators can manage their logic rules" ON public.survey_logic_rules
    FOR ALL USING (public.is_survey_owner(survey_id));

-- 8. UPDATED_AT TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_survey_sections_updated_at ON public.survey_sections;
CREATE TRIGGER set_survey_sections_updated_at BEFORE UPDATE ON public.survey_sections
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_survey_questions_updated_at ON public.survey_questions;
CREATE TRIGGER set_survey_questions_updated_at BEFORE UPDATE ON public.survey_questions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_survey_options_updated_at ON public.survey_options;
CREATE TRIGGER set_survey_options_updated_at BEFORE UPDATE ON public.survey_options
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_survey_logic_rules_updated_at ON public.survey_logic_rules;
CREATE TRIGGER set_survey_logic_rules_updated_at BEFORE UPDATE ON public.survey_logic_rules
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
