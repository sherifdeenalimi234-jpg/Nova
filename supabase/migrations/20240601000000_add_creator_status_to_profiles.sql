-- Add creator_status and creator_approved_at to profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'creator_status_type') THEN
        CREATE TYPE creator_status_type AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

-- Enhance profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS creator_status TEXT DEFAULT NULL CHECK (creator_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS creator_approved_at TIMESTAMP WITH TIME ZONE;

-- Enhance premium_requests table
ALTER TABLE public.premium_requests
ADD COLUMN IF NOT EXISTS verification_doc_url TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'INNOVATOR',
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Sync existing data
UPDATE public.profiles
SET creator_status = 'approved', creator_approved_at = NOW()
WHERE is_verified_creator = true;

-- Create creator_profiles for existing verified creators if they don't exist
INSERT INTO public.creator_profiles (id)
SELECT id FROM public.profiles
WHERE is_verified_creator = true
ON CONFLICT (id) DO NOTHING;
