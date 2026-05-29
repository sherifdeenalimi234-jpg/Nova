"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function requestCreatorAccess(paymentRef: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { error: requestError } = await supabase
    .from('premium_requests')
    .insert({
      user_id: user.id,
      payment_reference: paymentRef,
      status: 'pending'
    });

  if (requestError) return { error: requestError };

  // Also update the profile status for immediate visibility
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      creator_status: 'pending',
      approved: false
    })
    .eq('id', user.id);

  if (!profileError) {
    revalidatePath('/feed');
    revalidatePath('/settings/profile');
  }

  return { error: profileError };
}

export async function updateProfile(data: {
  full_name?: string;
  professional_title?: string;
  location?: string;
  bio?: string;
  long_bio?: string;
  skills?: string[];
  banner_url?: string;
  avatar_url?: string;
  contact_visibility?: any;
  is_available_for_collaboration?: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  // Split data between profiles and creator_profiles
  const profileFields = ['full_name', 'professional_title', 'location', 'banner_url', 'avatar_url'];
  const creatorFields = ['long_bio', 'skills', 'contact_visibility', 'is_available_for_collaboration'];

  const profileUpdate: any = {};
  const creatorUpdate: any = {};

  Object.entries(data).forEach(([key, value]) => {
    if (profileFields.includes(key)) profileUpdate[key] = value;
    if (creatorFields.includes(key)) creatorUpdate[key] = value;
  });

  let error = null;

  if (Object.keys(profileUpdate).length > 0) {
    const { error: pError } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', user.id);
    if (pError) error = pError;
  }

  if (!error && Object.keys(creatorUpdate).length > 0) {
    const { error: cError } = await supabase
      .from('creator_profiles')
      .update(creatorUpdate)
      .eq('id', user.id);
    if (cError) error = cError;
  }

  if (!error) {
    revalidatePath('/creator/settings');
    revalidatePath(`/u/${user.id}`); // This might need a proper username lookup
  }

  return { error };
}
