-- Function to check if the current user is an admin without causing recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow admins to update any profile
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Allow admins to update premium_requests
ALTER TABLE public.premium_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can update premium_requests" ON public.premium_requests;
CREATE POLICY "Admins can update premium_requests" ON public.premium_requests
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can select premium_requests" ON public.premium_requests;
CREATE POLICY "Admins can select premium_requests" ON public.premium_requests
FOR SELECT TO authenticated
USING (public.is_admin() OR (auth.uid() = user_id));

-- Allow admins to manage creator_profiles
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage creator_profiles" ON public.creator_profiles;
CREATE POLICY "Admins can manage creator_profiles" ON public.creator_profiles
FOR ALL TO authenticated
USING (public.is_admin());
