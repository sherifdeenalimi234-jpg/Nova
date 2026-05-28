"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function requestCreatorAccess(paymentRef: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { error } = await supabase
    .from('premium_requests')
    .insert({
      user_id: user.id,
      payment_reference: paymentRef,
      status: 'pending'
    });

  if (!error) {
    revalidatePath('/settings/profile');
  }

  return { error };
}
