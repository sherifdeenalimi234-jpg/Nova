-- PHASE 1B.2 BUILD MODULE FOUNDATION COMPLETION
-- Ensures all survey-related tables are robust and have proper RLS

-- 1. Create survey_sections if not exists
CREATE TABLE IF NOT EXISTS public.survey_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create survey_questions if not exists
CREATE TABLE IF NOT EXISTS public.survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.survey_sections(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    order_index INTEGER NOT NULL DEFAULT 0,
    placeholder TEXT,
    validation_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create survey_options if not exists
CREATE TABLE IF NOT EXISTS public.survey_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.survey_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_options ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Sections
DROP POLICY IF EXISTS "Creators can manage their own survey sections" ON public.survey_sections;
CREATE POLICY "Creators can manage their own survey sections" ON public.survey_sections
    FOR ALL
    USING (EXISTS (SELECT 1 FROM public.surveys WHERE id = survey_sections.survey_id AND creator_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.surveys WHERE id = survey_sections.survey_id AND creator_id = auth.uid()));

-- Questions
DROP POLICY IF EXISTS "Creators can manage their own survey questions" ON public.survey_questions;
CREATE POLICY "Creators can manage their own survey questions" ON public.survey_questions
    FOR ALL
    USING (EXISTS (SELECT 1 FROM public.surveys WHERE id = survey_questions.survey_id AND creator_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.surveys WHERE id = survey_questions.survey_id AND creator_id = auth.uid()));

-- Options
DROP POLICY IF EXISTS "Creators can manage their own survey options" ON public.survey_options;
CREATE POLICY "Creators can manage their own survey options" ON public.survey_options
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.survey_questions q
        JOIN public.surveys s ON q.survey_id = s.id
        WHERE q.id = survey_options.question_id AND s.creator_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.survey_questions q
        JOIN public.surveys s ON q.survey_id = s.id
        WHERE q.id = survey_options.question_id AND s.creator_id = auth.uid()
    ));

-- 6. Updated At Triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_survey_sections_updated_at ON public.survey_sections;
CREATE TRIGGER set_survey_sections_updated_at
    BEFORE UPDATE ON public.survey_sections
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_survey_questions_updated_at ON public.survey_questions;
CREATE TRIGGER set_survey_questions_updated_at
    BEFORE UPDATE ON public.survey_questions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_survey_options_updated_at ON public.survey_options;
CREATE TRIGGER set_survey_options_updated_at
    BEFORE UPDATE ON public.survey_options
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
