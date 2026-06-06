-- Refactor Surveys table for Survey Blueprint system

-- Add new columns to public.surveys
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS target_audience TEXT[];
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS target_responses INTEGER;
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS estimated_duration TEXT;
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN ('private', 'organization', 'public'));
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS anonymous_responses BOOLEAN DEFAULT TRUE;
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS collect_identity BOOLEAN DEFAULT FALSE;
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS advanced_settings JSONB DEFAULT '{}'::jsonb;

-- Ensure RLS allows creator full access
CREATE POLICY "Creators have full control over their surveys"
ON public.surveys
FOR ALL
TO authenticated
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_surveys_creator ON public.surveys(creator_id);
CREATE INDEX IF NOT EXISTS idx_surveys_project ON public.surveys(project_id);
