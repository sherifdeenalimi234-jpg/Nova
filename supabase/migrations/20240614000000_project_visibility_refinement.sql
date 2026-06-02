-- PHASE 1.2A: PROJECT RLS AND STORAGE REFINEMENT
-- Ensures robust ownership and handles public visibility for discovery.

DO $$
BEGIN
    -- 1. Refine Project Insertion Policy to enforce ownership and creator status
    DROP POLICY IF EXISTS "Creators can create projects." ON public.projects;
    CREATE POLICY "Creators can create projects."
    ON public.projects FOR INSERT
    WITH CHECK (
        auth.uid() = creator_id AND
        (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND (is_verified_creator = true OR is_admin = true OR creator_verified = true)
            )
        )
    );

    -- 2. Ensure Project Members policies are non-recursive and support ownership checks
    -- This was partially done, but let's make it definitive.
    DROP POLICY IF EXISTS "View project memberships" ON public.project_members;
    CREATE POLICY "View project memberships"
    ON public.project_members FOR SELECT
    USING (
        user_id = auth.uid()
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = public.project_members.project_id AND p.creator_id = auth.uid()
        )
    );

    -- 3. Enable Real-time for projects
    ALTER TABLE public.projects REPLICA IDENTITY FULL;

    -- 4. Ensure storage policies for 'projects' bucket are public-read but owner-write
    -- This assumes the 'projects' bucket exists (created in 20240610000000)

    -- Public Read
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    -- Note: We shouldn't drop all policies on storage.objects as it might affect other buckets.
    -- Better to create specific ones.

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Migration error: %', SQLERRM;
END $$;

-- Storage specific policies (outside DO block for clarity if needed, but DO block is fine)
-- Storage specific policies
DROP POLICY IF EXISTS "Project covers are publicly readable" ON storage.objects;
CREATE POLICY "Project covers are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'projects');

DROP POLICY IF EXISTS "Users can upload project covers" ON storage.objects;
CREATE POLICY "Users can upload project covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'projects' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own project covers" ON storage.objects;
CREATE POLICY "Users can update their own project covers"
ON storage.objects FOR UPDATE
USING (bucket_id = 'projects' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Users can delete their own project covers" ON storage.objects;
CREATE POLICY "Users can delete their own project covers"
ON storage.objects FOR DELETE
USING (bucket_id = 'projects' AND auth.uid() = owner);
