-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for 'documents' bucket
-- Dropping existing to ensure clean slate
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Admins Manage All" ON storage.objects;
DROP POLICY IF EXISTS "Users Manage Own" ON storage.objects;

-- Allow public viewing of documents (proofs) for admin verification
-- Allow users to view their own documents and admins to view everything
CREATE POLICY "View Documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND (
    (auth.uid() = owner) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
);

-- Allow authenticated users to upload their own proof
CREATE POLICY "Authenticated Uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

-- Allow admins full control over the documents bucket
CREATE POLICY "Admins Manage All"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'documents' AND
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
