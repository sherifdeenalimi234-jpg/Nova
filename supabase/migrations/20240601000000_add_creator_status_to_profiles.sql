-- Add creator approval fields and email to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS creator_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS creator_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS creator_status TEXT DEFAULT NULL CHECK (creator_status IN ('pending', 'approved', 'rejected'));

-- Backfill email from users table
UPDATE public.profiles p
SET email = u.email
FROM public.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Update handle_new_user function to sync email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  INSERT INTO public.profiles (id, full_name, avatar_url, is_admin, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    (new.email = 'sherifdeenalimititilope@gmail.com'),
    new.email
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sync existing data for verified creators
UPDATE public.profiles
SET
    creator_approved = true,
    approval_status = 'approved',
    creator_status = 'approved',
    creator_approved_at = NOW()
WHERE is_verified_creator = true AND (creator_status IS NULL OR approval_status = 'pending');

-- Create creator_profiles for existing verified creators if they don't exist
INSERT INTO public.creator_profiles (id)
SELECT id FROM public.profiles
WHERE is_verified_creator = true
ON CONFLICT (id) DO NOTHING;

-- SAFER SQL Execution helper for schema management - restricted to admins
CREATE OR REPLACE FUNCTION public.exec_sql_admin(sql_query TEXT)
RETURNS void AS $$
BEGIN
  -- Security check: only allow if the current user is an admin
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) THEN
    EXECUTE sql_query;
  ELSE
    RAISE EXCEPTION 'Unauthorized: Administrative privileges required for schema operations';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure RLS allows admins to update profiles for approval
-- Refactored to avoid recursion by using auth.jwt() instead of querying profiles if possible
-- or using a more direct check.
-- In Supabase, often is_admin can be set in app_metadata for better RLS.
-- For now, we'll use a safer subquery.
DROP POLICY IF EXISTS "Admins can update profiles for approval" ON public.profiles;
CREATE POLICY "Admins can update profiles for approval" ON public.profiles
FOR UPDATE TO authenticated
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
