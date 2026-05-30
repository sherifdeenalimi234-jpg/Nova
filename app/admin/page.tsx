import React from 'react';
import { createClient } from '@/lib/supabase/server';
import DashboardContent from '@/components/admin/DashboardContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch Stats
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: premiumUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified_creator', true);

  const { count: activeSurveys } = await supabase
    .from('surveys')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open');

  const { count: pendingPostsCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Creator Protocol Stats - Shared data source
  const { data: premiumRequests } = await supabase
    .from('premium_requests')
    .select('status');

  const pendingPremiumCount = premiumRequests?.filter(r => !r.status || r.status === 'pending').length || 0;
  const approvedPremiumCount = premiumRequests?.filter(r => r.status === 'approved').length || 0;
  const rejectedPremiumCount = premiumRequests?.filter(r => r.status === 'rejected').length || 0;

  return (
    <DashboardContent
      totalUsers={totalUsers || 0}
      premiumUsers={premiumUsers || 0}
      activeSurveys={activeSurveys || 0}
      pendingPostsCount={pendingPostsCount || 0}
      pendingPremiumCount={pendingPremiumCount || 0}
      approvedPremiumCount={approvedPremiumCount || 0}
      rejectedPremiumCount={rejectedPremiumCount || 0}
    />
  );
}
