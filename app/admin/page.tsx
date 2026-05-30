import React from 'react';
import { createClient } from '@/lib/supabase/server';
import DashboardContent from '@/components/admin/DashboardContent';

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

  // Creator Protocol Stats
  const { count: pendingPremiumCount } = await supabase
    .from('premium_requests')
    .select('*', { count: 'exact', head: true })
    .or('status.eq.pending,approval_status.eq.pending,verification_status.eq.pending');

  const { count: approvedPremiumCount } = await supabase
    .from('premium_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { count: rejectedPremiumCount } = await supabase
    .from('premium_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected');

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
