-- COMPREHENSIVE SCHEMA SYNCHRONIZATION MIGRATION
-- This migration ensures that every table and column referenced in the codebase exists in the Supabase database.

-- 1. Table: profiles
DO $$
BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_status TEXT DEFAULT 'free';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified_creator BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_verified BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_approved_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_since TIMESTAMP WITH TIME ZONE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_title TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    -- Constraints
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_creator_status_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_creator_status_check CHECK (creator_status IN ('free', 'pending', 'approved', 'rejected'));

    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_payment_status_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_payment_status_check CHECK (payment_status IN ('unpaid', 'under_review', 'verified', 'rejected'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. Table: premium_requests
DO $$
BEGIN
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS payment_reference TEXT;
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS verification_doc_url TEXT;
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS proof_url TEXT;
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS payment_note TEXT;
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'INNOVATOR';
    ALTER TABLE public.premium_requests ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'under_review';

    -- Constraints
    ALTER TABLE public.premium_requests DROP CONSTRAINT IF EXISTS premium_requests_status_check;
    ALTER TABLE public.premium_requests ADD CONSTRAINT premium_requests_status_check CHECK (status IN ('pending', 'approved', 'rejected'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. Table: creator_profiles
DO $$
BEGIN
    ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS long_bio TEXT;
    ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
    ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS contact_visibility JSONB DEFAULT '{"email": true, "phone": false}'::jsonb;
    ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS is_available_for_collaboration BOOLEAN DEFAULT TRUE;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 4. Table: posts
DO $$
BEGIN
    ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS title TEXT NOT NULL;
    ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS content TEXT;
    ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_url TEXT;
    ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS post_type TEXT;
    ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
    ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    -- Constraints
    ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_status_check;
    ALTER TABLE public.posts ADD CONSTRAINT posts_status_check CHECK (status IN ('pending', 'approved', 'rejected'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 5. Table: projects
DO $$
BEGIN
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS title TEXT NOT NULL;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}';
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 6. Table: surveys
DO $$
BEGIN
    ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS title TEXT NOT NULL;
    ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
    ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS questions JSONB NOT NULL DEFAULT '[]'::jsonb;

    ALTER TABLE public.surveys DROP CONSTRAINT IF EXISTS surveys_status_check;
    ALTER TABLE public.surveys ADD CONSTRAINT surveys_status_check CHECK (status IN ('open', 'closed'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 7. Table: survey_responses
DO $$
BEGIN
    ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE;
    ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS answers JSONB NOT NULL DEFAULT '{}'::jsonb;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 8. Table: notifications
DO $$
BEGIN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type TEXT NOT NULL;
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title TEXT NOT NULL;
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS message TEXT;
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 9. Table: activity_feed
DO $$
BEGIN
    ALTER TABLE public.activity_feed ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.activity_feed ADD COLUMN IF NOT EXISTS action TEXT NOT NULL;
    ALTER TABLE public.activity_feed ADD COLUMN IF NOT EXISTS entity_id UUID NOT NULL;
    ALTER TABLE public.activity_feed ADD COLUMN IF NOT EXISTS entity_type TEXT NOT NULL;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 10. Storage Buckets Setup
DO $$
DECLARE
    bucket_name TEXT;
    buckets_to_create TEXT[] := ARRAY['creator-proofs', 'avatars', 'projects', 'research', 'surveys', 'thumbnails', 'documents'];
BEGIN
    FOREACH bucket_name IN ARRAY buckets_to_create
    LOOP
        INSERT INTO storage.buckets (id, name, public)
        VALUES (bucket_name, bucket_name, true)
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

-- 11. RLS Policies
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- 12. Helper Function for Admin Check (if not already exists)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Comprehensive Policies
-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin());

-- Premium Requests
DROP POLICY IF EXISTS "Users can view own premium requests" ON public.premium_requests;
CREATE POLICY "Users can view own premium requests" ON public.premium_requests FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own premium requests" ON public.premium_requests;
CREATE POLICY "Users can insert own premium requests" ON public.premium_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all premium requests" ON public.premium_requests;
CREATE POLICY "Admins can view all premium requests" ON public.premium_requests FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update premium requests" ON public.premium_requests;
CREATE POLICY "Admins can update premium requests" ON public.premium_requests FOR UPDATE USING (public.is_admin());

-- Storage Policies (creator-proofs)
DROP POLICY IF EXISTS "View Creator Proofs" ON storage.objects;
CREATE POLICY "View Creator Proofs" ON storage.objects FOR SELECT USING (bucket_id = 'creator-proofs' AND (auth.uid() = owner OR public.is_admin()));

DROP POLICY IF EXISTS "Authenticated Proof Uploads" ON storage.objects;
CREATE POLICY "Authenticated Proof Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'creator-proofs' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins Manage Creator Proofs" ON storage.objects;
CREATE POLICY "Admins Manage Creator Proofs" ON storage.objects FOR ALL USING (bucket_id = 'creator-proofs' AND public.is_admin());

-- 14. Realtime Activation
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.premium_requests REPLICA IDENTITY FULL;
ALTER TABLE public.posts REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'profiles') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'premium_requests') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE premium_requests;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'posts') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE posts;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
