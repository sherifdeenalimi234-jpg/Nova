import React from 'react';
import { createClient } from '@/lib/supabase/server';
import CreatorsContent from '@/components/admin/CreatorsContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminCreatorsPage() {
  const supabase = await createClient();

  // Step 1: Fetch all premium requests with joined profiles
  // Joining premium_requests.user_id with profiles.id as requested
  const { data: requests, error: requestsError } = await supabase
    .from('premium_requests')
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        avatar_url,
        email
      )
    `)
    .order('created_at', { ascending: false });

  // Debug logging
  console.log(`[Admin] Creator Protocols Page: Found ${requests?.length || 0} total requests.`);

  if (requestsError) {
    console.error("[Admin] Error loading premium requests:", requestsError);
  }

  const joinedData = requests || [];

  return (
    <div className="p-4 md:p-8 bg-[#0a0a0b] min-h-screen text-white font-sans">
      <CreatorsContent initialRequests={joinedData} />
    </div>
  );
}
