export const dynamic = "force-dynamic";


import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ContentModerationContent from '@/components/admin/ContentModerationContent';

export default async function AdminContentPage() {
  const supabase = await createClient();

  const { data: pendingPosts } = await supabase!
    .from('posts')
    .select('*, author:profiles(full_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return <ContentModerationContent initialPosts={pendingPosts || []} />;
}
