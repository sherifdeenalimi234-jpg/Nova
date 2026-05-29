-- FULL SCHEMA SYNCHRONIZATION MIGRATION (Idempotent)

-- 1. Table: profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_status TEXT DEFAULT 'free' CHECK (creator_status IN ('free', 'pending', 'approved', 'rejected'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'under_review', 'verified', 'rejected'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified_creator BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_plan TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_since TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_badge_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- Ensure constraints (handle potential existing ones)
DO $$
BEGIN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_creator_status_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_creator_status_check CHECK (creator_status IN ('free', 'pending', 'approved', 'rejected'));

    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_payment_status_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_payment_status_check CHECK (payment_status IN ('unpaid', 'under_review', 'verified', 'rejected'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. Table: premium_requests
ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS payment_note TEXT;
ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS verification_doc_url TEXT;
ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS proof_url TEXT;
ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS verification_status TEXT;
ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS approval_status TEXT;
ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);
ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS admin_note TEXT;
ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS category TEXT;

-- 3. Table: posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- 4. Storage Setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('creator-proofs', 'creator-proofs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for creator-proofs
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

-- 5. Realtime Configuration
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.premium_requests REPLICA IDENTITY FULL;
ALTER TABLE public.posts REPLICA IDENTITY FULL;

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

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE posts;
  END IF;
END $$;

-- 6. Final Data Sync
UPDATE public.profiles SET creator_status = 'free' WHERE creator_status IS NULL;
UPDATE public.profiles SET payment_status = 'verified', creator_status = 'approved', is_verified_creator = true WHERE is_verified_creator = true;
