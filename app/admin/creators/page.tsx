import React from 'react';
import { createClient } from '@/lib/supabase/server';
import CreatorsContent from '@/components/admin/CreatorsContent';

export default async function AdminCreatorsPage() {
  const supabase = await createClient();

  const { data: premiumRequests } = await supabase
    .from('premium_requests')
    .select('*, profiles(full_name, avatar_url)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return <CreatorsContent initialRequests={premiumRequests || []} />;
}
