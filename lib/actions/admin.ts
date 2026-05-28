"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function moderatePost(postId: string, status: 'approved' | 'rejected') {
  const supabase = await createClient();

  const { error } = await supabase
    .from('posts')
    .update({ status })
    .eq('id', postId);

  if (!error) {
    revalidatePath('/admin');
  }

  return { error };
}

export async function moderatePremiumRequest(requestId: string, status: 'approved' | 'rejected') {
  const supabase = await createClient();

  // 1. Update the request status
  const { data: request, error: requestError } = await supabase
    .from('premium_requests')
    .update({ status })
    .eq('id', requestId)
    .select()
    .single();

  if (requestError) return { error: requestError };

  // 2. If approved, upgrade the user's profile to verified creator
  if (status === 'approved') {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_verified_creator: true })
      .eq('id', request.user_id);

    if (profileError) return { error: profileError };
  }

  revalidatePath('/admin');
  return { success: true };
}
