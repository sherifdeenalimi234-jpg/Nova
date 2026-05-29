-- Enhance Profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS professional_title TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Enhance Creator Profiles table
ALTER TABLE public.creator_profiles
ADD COLUMN IF NOT EXISTS long_bio TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS contact_visibility JSONB DEFAULT '{"email": true, "phone": false}'::jsonb;

-- Ensure RLS is updated if needed
-- (Assuming initial schema already has some RLS)
CREATE POLICY "Users can update own creator profile." ON public.creator_profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public creator profiles are viewable by everyone." ON public.creator_profiles
FOR SELECT USING (true);
