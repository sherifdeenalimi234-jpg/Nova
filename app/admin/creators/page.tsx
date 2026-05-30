import React from 'react';
import { createClient } from '@/lib/supabase/server';
import CreatorsContent from '@/components/admin/CreatorsContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminCreatorsPage() {
  const supabase = await createClient();

  // Step 1: Fetch all premium requests
  // We fetch without join first to guarantee we get the records seen by the dashboard
  // Removed .order() to ensure maximum compatibility and speed
  const { data: requests, error: requestsError } = await supabase
    .from('premium_requests')
    .select();

  // Debug logging
  console.log(`[Admin] Creator Protocols Page: Found ${requests?.length || 0} total requests.`);

  if (requestsError) {
    console.error("[Admin] Error loading premium requests:", requestsError);
  }

  // Step 2: Fetch profiles for these users to perform manual join
  // This bypasses issues with complex Supabase joins or RLS on joined tables
  let joinedData = requests || [];

  if (requests && requests.length > 0) {
    const userIds = [...new Set(requests.map(r => r.user_id))].filter(Boolean);

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, email')
      .in('id', userIds);

    if (profilesError) {
      console.error("[Admin] Error loading profiles for join:", profilesError);
    }

    // Manual join
    const profileMap = (profiles || []).reduce((acc: any, p: any) => {
      acc[p.id] = p;
      return acc;
    }, {});

    joinedData = requests.map(r => ({
      ...r,
      profiles: profileMap[r.user_id] || null
    })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return (
    <div className="p-4 md:p-8 bg-[#0a0a0b] min-h-screen text-white font-sans">
      <CreatorsContent initialRequests={joinedData} />
    </div>
  );
}
