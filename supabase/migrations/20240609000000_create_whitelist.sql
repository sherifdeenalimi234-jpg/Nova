-- Create creator_whitelist table
CREATE TABLE IF NOT EXISTS public.creator_whitelist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    added_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.creator_whitelist ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage creator_whitelist" ON public.creator_whitelist
    FOR ALL USING (public.is_admin());

-- Realtime
ALTER TABLE public.creator_whitelist REPLICA IDENTITY FULL;
IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'creator_whitelist') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE creator_whitelist;
END IF;
