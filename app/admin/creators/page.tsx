import React from 'react';
import { createClient } from '@/lib/supabase/server';
import CreatorsContent from '@/components/admin/CreatorsContent';

export default async function AdminCreatorsPage() {
  const supabase = await createClient();

  console.log("[Admin] Fetching all premium requests for Protocols Dashboard...");

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
      admin_note,
      category,
      created_at,
      profiles(full_name, avatar_url, email)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Admin Error (Fetching Premium Requests):", error);
  } else {
    console.log("Admin Requests fetched successfully. Total count:", premiumRequests?.length);
    console.log("Admin Requests Sample:", premiumRequests?.slice(0, 2));
  }

  return <CreatorsContent initialRequests={premiumRequests || []} />;
}
