-- PHASE 1B.1: SURVEY SECTION ARCHITECTURE
-- This migration adds the survey_sections table and updates survey_questions to support sections.

BEGIN;

-- 1. Create survey_sections table
CREATE TABLE IF NOT EXISTS public.survey_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Add section_id to survey_questions
ALTER TABLE public.survey_questions
ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.survey_sections(id) ON DELETE SET NULL;

-- 3. Update Question Type Constraint
ALTER TABLE public.survey_questions DROP CONSTRAINT IF EXISTS survey_questions_type_check;
ALTER TABLE public.survey_questions ADD CONSTRAINT survey_questions_type_check
CHECK (type IN ('short_text', 'long_text', 'single_choice', 'multiple_choice', 'dropdown', 'rating', 'yes_no', 'date', 'number'));

-- 4. Enable RLS on survey_sections
ALTER TABLE public.survey_sections ENABLE ROW LEVEL SECURITY;

-- 5. Add RLS policies for survey_sections
CREATE POLICY "Creators can manage sections of their surveys" ON public.survey_sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.surveys
            WHERE surveys.id = survey_sections.survey_id
            AND surveys.creator_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view sections of published surveys" ON public.survey_sections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.surveys
            WHERE surveys.id = survey_sections.survey_id
            AND (surveys.status = 'published' OR surveys.creator_id = auth.uid())
        )
    );

-- 6. Add updated_at trigger for survey_sections
CREATE TRIGGER update_survey_sections_updated_at
    BEFORE UPDATE ON public.survey_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_survey_sections_survey ON public.survey_sections(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_section ON public.survey_questions(section_id);

COMMIT;
