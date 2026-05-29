"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function requestCreatorAccess(paymentRef: string, proofUrl?: string, note?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Authentication required." };

    // Log the initiation
    console.log(`[Profile] Initiating creator access request for user ${user.id}`);

    console.log("[Profile] Data to insert:", {
      user_id: user.id,
      payment_reference: paymentRef,
      verification_doc_url: proofUrl,
      payment_note: note,
    });

    const { data: insertData, error: requestError } = await supabase
      .from('premium_requests')
      .insert({
        user_id: user.id,
        payment_reference: paymentRef,
        verification_doc_url: proofUrl,
        proof_url: proofUrl,
        payment_note: note,
        status: 'pending',
        approval_status: 'pending',
        verification_status: 'under_review'
      })
      .select();

    console.log("[Profile] Insert Result:", { insertData, requestError });

    if (requestError) {
      console.error("[Profile] Error inserting premium request:", requestError);
      return { error: `Database submission failed: ${requestError.message} (Code: ${requestError.code})` };
    }

    // Also update the profile status for immediate visibility
    console.log("[Profile] Updating profile for user:", user.id);
    const { data: updateData, error: profileError } = await supabase
      .from('profiles')
      .update({
        creator_status: 'pending',
        payment_status: 'under_review',
        verification_status: 'pending',
        verification_submitted_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select();

    console.log("[Profile] Profile Update Result:", { updateData, profileError });

    if (profileError) {
      console.error("[Profile] Error updating profile status:", profileError);
      // We don't return here because the request was already inserted
    }

    revalidatePath('/feed');
    revalidatePath('/settings/profile');

    return { error: null };
  } catch (err: any) {
    console.error("[Profile] Unexpected error in requestCreatorAccess:", err);
    return { error: "An unexpected system error occurred. Our engineers have been notified." };
  }
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
