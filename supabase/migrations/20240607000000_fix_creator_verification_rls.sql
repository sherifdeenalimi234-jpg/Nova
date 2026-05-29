-- FIX AND POLISH FOR CREATOR VERIFICATION FLOW

-- 1. Ensure premium_requests has all necessary columns and correct types
DO $$
BEGIN
    -- Ensure columns exist
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
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

    -- Update constraints if they exist to be correct
    ALTER TABLE public.premium_requests DROP CONSTRAINT IF EXISTS premium_requests_status_check;
    ALTER TABLE public.premium_requests ADD CONSTRAINT premium_requests_status_check CHECK (status IN ('pending', 'approved', 'rejected'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. Ensure profiles has all necessary columns
DO $$
BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_status TEXT DEFAULT 'free';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified_creator BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_creator_status_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_creator_status_check CHECK (creator_status IN ('free', 'pending', 'approved', 'rejected'));

    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_payment_status_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_payment_status_check CHECK (payment_status IN ('unpaid', 'under_review', 'verified', 'rejected'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. RLS Policies for premium_requests
ALTER TABLE public.premium_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own premium requests" ON public.premium_requests;
CREATE POLICY "Users can insert own premium requests"
ON public.premium_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own premium requests" ON public.premium_requests;
CREATE POLICY "Users can view own premium requests"
ON public.premium_requests FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all premium requests" ON public.premium_requests;
CREATE POLICY "Admins can view all premium requests"
ON public.premium_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

DROP POLICY IF EXISTS "Admins can update premium requests" ON public.premium_requests;
CREATE POLICY "Admins can update premium requests"
ON public.premium_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- 4. Profiles RLS Policies (Ensuring users can update their own profile and admins can update all)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- 5. Storage RLS Policies (Ensuring creator-proofs is fully accessible to owner and admins)
INSERT INTO storage.buckets (id, name, public)
VALUES ('creator-proofs', 'creator-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for viewing
DROP POLICY IF EXISTS "View Creator Proofs" ON storage.objects;
CREATE POLICY "View Creator Proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'creator-proofs' AND (
    (auth.uid() = owner) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
);

-- Policy for uploading
DROP POLICY IF EXISTS "Authenticated Proof Uploads" ON storage.objects;
CREATE POLICY "Authenticated Proof Uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'creator-proofs'
);

-- Policy for full admin control
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

-- 6. Realtime activation
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.premium_requests REPLICA IDENTITY FULL;

-- Ensure added to publication
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
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
