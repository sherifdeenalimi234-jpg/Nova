import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ContentModerationContent from '@/components/admin/ContentModerationContent';

export default async function AdminContentPage() {
  const supabase = await createClient();

  const { data: recentPosts } = await supabase
    .from('posts')
    .select('*, author:profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(50);

  return <ContentModerationContent initialPosts={recentPosts || []} />;
}
