-- DEFINITIVE FIX FOR CREATOR SYSTEM DATABASE SCHEMA

-- 1. Enhance profiles table
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_creator_status_check;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_status TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD CONSTRAINT profiles_creator_status_check CHECK (creator_status IN ('free', 'pending', 'approved', 'rejected'));

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_payment_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_payment_status_check CHECK (payment_status IN ('unpaid', 'under_review', 'verified', 'rejected'));

-- 2. Enhance premium_requests table
ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS payment_note TEXT;
ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS verification_doc_url TEXT;

-- 3. Setup Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('creator-proofs', 'creator-proofs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for creator-proofs
DROP POLICY IF EXISTS "View Creator Proofs" ON storage.objects;
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

DROP POLICY IF EXISTS "Authenticated Proof Uploads" ON storage.objects;
CREATE POLICY "Authenticated Proof Uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'creator-proofs' AND
  auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Admins Manage Creator Proofs" ON storage.objects;
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

-- 4. Enable Realtime
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.premium_requests REPLICA IDENTITY FULL;

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

-- 5. Data Synchronization
UPDATE public.profiles SET creator_status = 'free' WHERE creator_status IS NULL;
UPDATE public.profiles SET payment_status = 'verified', creator_status = 'approved' WHERE is_verified_creator = true;
