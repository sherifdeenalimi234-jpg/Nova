-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('creator-proofs', 'creator-proofs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for 'creator-proofs' bucket
-- Dropping existing to ensure clean slate
DROP POLICY IF EXISTS "View Documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Admins Manage All" ON storage.objects;

-- Allow users to view their own documents and admins to view everything
CREATE POLICY "View Creator Proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'creator-proofs' AND (
    (auth.uid() = owner) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
);

-- Allow authenticated users to upload their own proof
CREATE POLICY "Authenticated Proof Uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'creator-proofs' AND
  auth.role() = 'authenticated'
);

-- Allow admins full control over the creator-proofs bucket
CREATE POLICY "Admins Manage Creator Proofs"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'creator-proofs' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Enable Realtime for core tables
-- This ensures the "No Refresh" requirement works
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.premium_requests REPLICA IDENTITY FULL;

-- Add tables to the realtime publication
-- Note: If these are already added, this might fail, so we use a DO block
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'premium_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE premium_requests;
  END IF;
END $$;
