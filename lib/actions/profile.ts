"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function requestCreatorAccess(paymentRef: string, proofUrl?: string, note?: string) {
  try {
    console.log("[Profile] Starting requestCreatorAccess server action...");
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error("[Profile] Auth Error:", authError);
      return { error: `Authentication error: ${authError.message}` };
    }

    if (!user) {
      console.error("[Profile] No user found in session.");
      return { error: "Authentication required. Please log in again." };
    }

    // Log the initiation
    console.log(`[Profile] Initiating creator access request for user ${user.id}`);

    // Check for existing pending or approved request to prevent duplicates
    const { data: existingRequests, error: existingError } = await supabase
      .from('premium_requests')
      .select('id, status, approval_status, verification_status')
      .eq('user_id', user.id)
      .or('status.in.(pending,approved),approval_status.in.(pending,approved),verification_status.in.(pending,approved)')
      .limit(1);

    if (existingError) {
      console.error("[Profile] Error checking for existing request:", existingError);
    }

    if (existingRequests && existingRequests.length > 0) {
      const req = existingRequests[0];
      const isApproved = req.status === 'approved' || req.approval_status === 'approved' || req.verification_status === 'approved';
      return {
        error: isApproved
          ? "You are already a verified creator."
          : "You already have a pending creator verification request."
      };
    }

    const payload = {
      user_id: user.id,
      payment_reference: paymentRef,
      verification_doc_url: proofUrl,
      proof_url: proofUrl,
      payment_note: note,
      status: 'pending',
      approval_status: 'pending',
      verification_status: 'under_review'
    };

    console.log("[Profile] Data to insert into premium_requests:", payload);

    const { data: insertData, error: requestError } = await supabase
      .from('premium_requests')
      .insert(payload)
      .select();

    if (requestError) {
      console.error("[Profile] Error inserting premium request:", {
        message: requestError.message,
        code: requestError.code,
        details: requestError.details,
        hint: requestError.hint
      });
      return { error: `Database submission failed: ${requestError.message} (Code: ${requestError.code})` };
    }

    console.log("[Profile] Insert successful:", insertData);

    // Also update the profile status for immediate visibility
    console.log("[Profile] Updating profile for user:", user.id);
    const profileUpdate = {
      creator_status: 'pending',
      payment_status: 'under_review',
      verification_status: 'pending',
      verification_submitted_at: new Date().toISOString()
    };

    console.log("[Profile] Profile update payload:", profileUpdate);

    const { data: updateData, error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', user.id)
      .select();

    if (profileError) {
      console.error("[Profile] Error updating profile status:", {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details
      });
      // We don't return error here because the request was already inserted successfully
    } else {
      console.log("[Profile] Profile update successful:", updateData);
    }

    revalidatePath('/feed');
    revalidatePath('/settings/profile');
    revalidatePath('/admin');

    return { error: null };
  } catch (err: any) {
    console.error("[Profile] Unexpected error in requestCreatorAccess:", err);
    return { error: `System Error: ${err.message || "An unexpected system error occurred."}` };
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
