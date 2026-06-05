-- Update surveys table schema
ALTER TABLE public.surveys
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Update status constraint
ALTER TABLE public.surveys DROP CONSTRAINT IF EXISTS surveys_status_check;
ALTER TABLE public.surveys ADD CONSTRAINT surveys_status_check CHECK (status IN ('draft', 'published', 'closed'));

-- Update default status
ALTER TABLE public.surveys ALTER COLUMN status SET DEFAULT 'draft';

-- Ensure RLS is enabled
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public surveys are viewable by everyone." ON public.surveys;
DROP POLICY IF EXISTS "Creators can insert their own surveys" ON public.surveys;
DROP POLICY IF EXISTS "Creators can update their own surveys" ON public.surveys;
DROP POLICY IF EXISTS "Creators can delete their own surveys" ON public.surveys;

-- Create new policies
CREATE POLICY "Public surveys are viewable by everyone." ON public.surveys
  FOR SELECT USING (status = 'published' OR auth.uid() = creator_id);

CREATE POLICY "Creators can insert their own surveys" ON public.surveys
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own surveys" ON public.surveys
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own surveys" ON public.surveys
  FOR DELETE USING (auth.uid() = creator_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_surveys_updated_at
    BEFORE UPDATE ON public.surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update survey_responses RLS to allow creators to see responses to their surveys
DROP POLICY IF EXISTS "Creators can view responses to their surveys" ON public.survey_responses;
CREATE POLICY "Creators can view responses to their surveys" ON public.survey_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.surveys
      WHERE surveys.id = survey_responses.survey_id
      AND surveys.creator_id = auth.uid()
    )
  );
