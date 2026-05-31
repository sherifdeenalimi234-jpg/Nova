-- MASTER SCHEMA SYNCHRONIZATION MIGRATION (Idempotent)
-- Phase 1 Foundation & Creator System

-- 1. Table: profiles
DO $$
BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified_creator BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_status TEXT DEFAULT 'free';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_verified BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_plan TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_since TIMESTAMP WITH TIME ZONE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_approved_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_badge_visible BOOLEAN DEFAULT TRUE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_title TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;

    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_creator_status_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_creator_status_check CHECK (creator_status IN ('free', 'pending', 'approved', 'rejected'));
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_payment_status_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_payment_status_check CHECK (payment_status IN ('unpaid', 'under_review', 'verified', 'rejected'));
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 2. Table: premium_requests
DO $$
BEGIN
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS reviewed_by UUID;
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS payment_reference TEXT;
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS verification_doc_url TEXT;
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS proof_url TEXT;
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS payment_note TEXT;
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'INNOVATOR';
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'under_review';
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS admin_note TEXT;

    ALTER TABLE public.premium_requests DROP CONSTRAINT IF EXISTS premium_requests_status_check;
    ALTER TABLE public.premium_requests ADD CONSTRAINT premium_requests_status_check CHECK (status IN ('pending', 'approved', 'rejected'));
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 3. Table: creator_profiles
DO $$
BEGIN
    ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS long_bio TEXT;
    ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
    ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS contact_visibility JSONB DEFAULT '{"email": true, "phone": false}'::jsonb;
    ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS is_available_for_collaboration BOOLEAN DEFAULT TRUE;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 4. Tables: posts, projects, surveys
DO $$
BEGIN
    ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}';
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 5. Storage Buckets Initialization
DO $$
DECLARE
    bucket_name TEXT;
    buckets_to_create TEXT[] := ARRAY['creator-proofs', 'avatars', 'projects', 'research', 'surveys', 'thumbnails', 'documents'];
BEGIN
    FOREACH bucket_name IN ARRAY buckets_to_create LOOP
        INSERT INTO storage.buckets (id, name, public) VALUES (bucket_name, bucket_name, true) ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

-- 6. Automatic Whitelist & Identity Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$$
DECLARE
  is_admin_user BOOLEAN := (new.email = 'sherifdeenalimititilope@gmail.com');
  is_approved_creator BOOLEAN := (new.email IN (
    'sherifdeenalimi234@gmail.com',
    'kudiratlolade1999@gmail.com',
    'scholarsnetworkacademy@gmail.com',
    'sherifdeentobiloba@gmail.com',
    'olajumokebello03@gmail.com',
    'inioluwakelly@gmail.com',
    'yusufsalui6@gmail.com'
  ));
BEGIN
  INSERT INTO public.users (id, email) VALUES (new.id, new.email) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.profiles (id, full_name, avatar_url, is_admin, is_verified_creator, creator_status, payment_status, creator_plan)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', is_admin_user, is_approved_creator,
    CASE WHEN is_approved_creator THEN 'approved' ELSE 'free' END,
    CASE WHEN is_approved_creator THEN 'verified' ELSE 'unpaid' END,
    CASE WHEN is_approved_creator THEN 'premium' ELSE NULL END)
  ON CONFLICT (id) DO UPDATE SET
    is_admin = EXCLUDED.is_admin,
    is_verified_creator = EXCLUDED.is_verified_creator,
    creator_status = EXCLUDED.creator_status,
    payment_status = EXCLUDED.payment_status,
    creator_plan = EXCLUDED.creator_plan;

  IF is_approved_creator THEN
    INSERT INTO public.creator_profiles (id) VALUES (new.id) ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN new;
END;
$$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Table: project_members (Added per Stabilization Audit)
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view project members" ON public.project_members;
CREATE POLICY "Public can view project members" ON public.project_members FOR SELECT USING (true);
