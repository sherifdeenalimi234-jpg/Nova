export const dynamic = "force-dynamic";


import React from 'react';
import { createClient } from '@/lib/supabase/server';
import DashboardContent from '@/components/admin/DashboardContent';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch summary stats
  const [
    { count: usersCount },
    { count: creatorCount },
    { count: surveysCount },
    { count: pendingPostsCount }
  ] = await Promise.all([
    supabase!.from('profiles').select('*', { count: 'exact', head: true }),
    supabase!.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified_creator', true),
    supabase!.from('surveys').select('*', { count: 'exact', head: true }),
    supabase!.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  ]);

  return (
    <DashboardContent
      totalUsers={usersCount || 0}
      premiumUsers={creatorCount || 0}
      activeSurveys={surveysCount || 0}
      pendingPostsCount={pendingPostsCount || 0}
    />
  );
}
