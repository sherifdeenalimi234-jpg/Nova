-- Update creator_status check constraint to include 'free'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_creator_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_creator_status_check CHECK (creator_status IN ('free', 'pending', 'approved', 'rejected'));

-- Add payment_status to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'under_review', 'verified', 'rejected'));

-- Add payment_note to premium_requests
ALTER TABLE public.premium_requests
ADD COLUMN IF NOT EXISTS payment_note TEXT;

-- Sync existing data
UPDATE public.profiles SET creator_status = 'free' WHERE creator_status IS NULL;
UPDATE public.profiles SET payment_status = 'verified' WHERE is_verified_creator = true;
