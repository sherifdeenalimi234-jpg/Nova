# SURVEY DATABASE SQL REQUIREMENTS

## 1. Structural Updates

```sql
-- 1. Create survey_sections
CREATE TABLE IF NOT EXISTS public.survey_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Update survey_questions to support sections
ALTER TABLE public.survey_questions ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.survey_sections(id) ON DELETE SET NULL;
ALTER TABLE public.survey_questions ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;

-- 3. Create survey_answers for normalization
CREATE TABLE IF NOT EXISTS public.survey_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    response_id UUID REFERENCES public.survey_responses(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.survey_questions(id) ON DELETE CASCADE NOT NULL,
    option_id UUID REFERENCES public.survey_options(id) ON DELETE SET NULL,
    text_value TEXT,
    numeric_value NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create survey_members for collaboration
CREATE TABLE IF NOT EXISTS public.survey_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('Owner', 'Editor', 'Analyst', 'Viewer')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(survey_id, user_id)
);
```

## 2. Logic Engine

```sql
-- 1. Create survey_logic_nodes
CREATE TABLE IF NOT EXISTS public.survey_logic_nodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create survey_logic_connections
CREATE TABLE IF NOT EXISTS public.survey_logic_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_node_id UUID REFERENCES public.survey_logic_nodes(id) ON DELETE CASCADE NOT NULL,
    target_node_id UUID REFERENCES public.survey_logic_nodes(id) ON DELETE CASCADE NOT NULL,
    condition_config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

## 3. Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_survey_sections_survey_id ON public.survey_sections(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_section_id ON public.survey_questions(section_id);
CREATE INDEX IF NOT EXISTS idx_survey_answers_response_id ON public.survey_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_survey_members_user_id ON public.survey_members(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_logic_survey_id ON public.survey_logic_nodes(survey_id);
```

## 4. RLS helper function

```sql
-- Helper to check if a user has a role in a survey
CREATE OR REPLACE FUNCTION public.check_survey_role(survey_uuid UUID, required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.surveys s
        WHERE s.id = survey_uuid AND s.creator_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM public.survey_members sm
        WHERE sm.survey_id = survey_uuid AND sm.user_id = auth.uid() AND sm.role = ANY(required_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
