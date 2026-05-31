export const dynamic = "force-dynamic";


import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PremiumVerification from '@/components/admin/PremiumVerification';

export default async function AdminCreatorsPage() {
  const supabase = await createClient();

  const { data: requests } = await supabase!
    .from('premium_requests')
    .select('*, profiles(full_name, avatar_url, email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 md:p-10">
      <PremiumVerification initialRequests={(requests as any) || []} />
    </div>
  );
}
