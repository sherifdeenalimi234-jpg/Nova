export const dynamic = "force-dynamic";


import React from 'react';
import { createClient } from '@/lib/supabase/server';
import UsersContent from '@/components/admin/UsersContent';

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase!
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return <UsersContent initialUsers={users || []} />;
}
