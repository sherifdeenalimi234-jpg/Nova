import React from 'react';
import { createClient } from '@/lib/supabase/server';
import CreatorsContent from '@/components/admin/CreatorsContent';

export default async function AdminCreatorsPage() {
  const supabase = await createClient();

  const { data: premiumRequests, error } = await supabase
    .from('premium_requests')
    .select(`
      id,
      user_id,
      payment_reference,
      proof_url,
      verification_doc_url,
      payment_note,
      status,
      approval_status,
      verification_status,
      reviewed_at,
      reviewed_by,
      approved_at,
      category,
      created_at,
      profiles(full_name, avatar_url, email)
    `)
    .or('status.eq.pending,approval_status.eq.pending,verification_status.eq.pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Premium Requests Error:", error);
  } else {
    console.log("Premium Requests:", premiumRequests);
  }

  return <CreatorsContent initialRequests={premiumRequests || []} />;
}
