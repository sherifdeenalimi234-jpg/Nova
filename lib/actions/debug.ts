"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function debugAdminStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No user found in session" };

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, is_admin, email')
    .eq('id', user.id)
    .single();

  return { user, profile, error };
}
