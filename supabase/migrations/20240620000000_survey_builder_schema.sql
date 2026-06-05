-- Migration: Refactor Survey Schema for Builder System
-- Step 1: Add new columns to surveys
ALTER TABLE public.surveys
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS estimated_time INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"anonymous": false, "one_response_per_participant": true}'::jsonb;

-- Step 2: Create survey_questions table
CREATE TABLE IF NOT EXISTS public.survey_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('short_text', 'long_text', 'single_choice', 'multiple_choice', 'dropdown', 'rating')),
    title TEXT NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    placeholder TEXT,
    validation_rules JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Step 3: Create survey_options table
CREATE TABLE IF NOT EXISTS public.survey_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES public.survey_questions(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Step 4: Enable RLS on new tables
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_options ENABLE ROW LEVEL SECURITY;

-- Step 5: Add RLS policies
-- survey_questions policies
CREATE POLICY "Creators can manage questions of their surveys" ON public.survey_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.surveys
            WHERE surveys.id = survey_questions.survey_id
            AND surveys.creator_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view questions of published surveys" ON public.survey_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.surveys
            WHERE surveys.id = survey_questions.survey_id
            AND (surveys.status = 'published' OR surveys.creator_id = auth.uid())
        )
    );

-- survey_options policies
CREATE POLICY "Creators can manage options of their questions" ON public.survey_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.survey_questions
            JOIN public.surveys ON surveys.id = survey_questions.survey_id
            WHERE survey_questions.id = survey_options.question_id
            AND surveys.creator_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view options of published survey questions" ON public.survey_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.survey_questions
            JOIN public.surveys ON surveys.id = survey_questions.survey_id
            WHERE survey_questions.id = survey_options.question_id
            AND (surveys.status = 'published' OR surveys.creator_id = auth.uid())
        )
    );

-- Step 6: Add updated_at triggers
CREATE TRIGGER update_survey_questions_updated_at
    BEFORE UPDATE ON public.survey_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_options_updated_at
    BEFORE UPDATE ON public.survey_options
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
