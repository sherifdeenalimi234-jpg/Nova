-- SURVEY SYSTEM V2 NORMALIZED SCHEMA

-- 1. Table: surveys (Enhanced)
-- Note: We drop existing if needed or just create new ones. Since we're rebuilding, let's ensure clean state for these tables.
DROP TABLE IF EXISTS public.survey_answers CASCADE;
DROP TABLE IF EXISTS public.survey_responses CASCADE;
DROP TABLE IF EXISTS public.survey_options CASCADE;
DROP TABLE IF EXISTS public.survey_questions CASCADE;
DROP TABLE IF EXISTS public.surveys CASCADE;

CREATE TABLE public.surveys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
    category TEXT DEFAULT 'General',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Table: survey_questions
CREATE TABLE public.survey_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'multiple_choice', 'rating', 'file')),
    question_text TEXT NOT NULL,
    order_index INT NOT NULL,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Table: survey_options
CREATE TABLE public.survey_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES public.survey_questions(id) ON DELETE CASCADE NOT NULL,
    option_text TEXT NOT NULL,
    order_index INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Table: survey_responses
CREATE TABLE public.survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(survey_id, user_id) -- Prevent duplicate responses per user
);

-- 5. Table: survey_answers
CREATE TABLE public.survey_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    response_id UUID REFERENCES public.survey_responses(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.survey_questions(id) ON DELETE CASCADE NOT NULL,
    option_id UUID REFERENCES public.survey_options(id) ON DELETE SET NULL,
    text_answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS POLICIES

ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_answers ENABLE ROW LEVEL SECURITY;

-- Surveys
CREATE POLICY "Creators can manage their own surveys" ON public.surveys
    FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Published surveys are viewable by everyone" ON public.surveys
    FOR SELECT USING (status = 'published');

-- Survey Questions
CREATE POLICY "Creators can manage questions of their own surveys" ON public.survey_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.surveys
            WHERE surveys.id = survey_questions.survey_id
            AND surveys.creator_id = auth.uid()
        )
    );

CREATE POLICY "Questions of published surveys are viewable" ON public.survey_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.surveys
            WHERE surveys.id = survey_questions.survey_id
            AND surveys.status = 'published'
        )
    );

-- Survey Options
CREATE POLICY "Creators can manage options of their own surveys" ON public.survey_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.survey_questions q
            JOIN public.surveys s ON s.id = q.survey_id
            WHERE q.id = survey_options.question_id
            AND s.creator_id = auth.uid()
        )
    );

CREATE POLICY "Options of published surveys are viewable" ON public.survey_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.survey_questions q
            JOIN public.surveys s ON s.id = q.survey_id
            WHERE q.id = survey_options.question_id
            AND s.status = 'published'
        )
    );

-- Survey Responses
CREATE POLICY "Users can view their own responses" ON public.survey_responses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Creators can view responses to their own surveys" ON public.survey_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.surveys
            WHERE surveys.id = survey_responses.survey_id
            AND surveys.creator_id = auth.uid()
        )
    );

CREATE POLICY "Users can submit responses to published surveys" ON public.survey_responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.surveys
            WHERE surveys.id = survey_responses.survey_id
            AND surveys.status = 'published'
        )
    );

-- Survey Answers
CREATE POLICY "Users can view their own answers" ON public.survey_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.survey_responses r
            WHERE r.id = survey_answers.response_id
            AND r.user_id = auth.uid()
        )
    );

CREATE POLICY "Creators can view answers for their own surveys" ON public.survey_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.survey_responses r
            JOIN public.surveys s ON s.id = r.survey_id
            WHERE r.id = survey_answers.response_id
            AND s.creator_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert answers for their own responses" ON public.survey_answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.survey_responses r
            WHERE r.id = survey_answers.response_id
            AND r.user_id = auth.uid()
        )
    );
