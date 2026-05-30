import React from 'react';
import { createClient } from '@/lib/supabase/server';
import CreatorsContent from '@/components/admin/CreatorsContent';

export default async function AdminCreatorsPage() {
  const supabase = await createClient();

  // Load requests with profile join
  // The join key is user_id -> profiles.id
  // We use .or() to sync with dashboard pending count logic
  const { data: joinedData, error: joinedError } = await supabase
    .from('premium_requests')
    .select('*, profiles!user_id(full_name, avatar_url, email)')
    .order('created_at', { ascending: false });

  if (joinedError) {
    console.error("[Admin] Error loading joined creator requests:", joinedError);
  }

  return (
    <div className="p-4 md:p-8 bg-[#0a0a0b] min-h-screen text-white font-sans">
      <CreatorsContent initialRequests={joinedData || []} />
    </div>
  );
}
