"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function moderatePost(postId: string, status: 'approved' | 'rejected') {
  const supabase = await createClient();

  const { error } = await supabase
    .from('posts')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', postId);

  if (!error) {
    revalidatePath('/admin');
    revalidatePath('/admin/content');
  }

  return { error };
}

export async function featurePost(postId: string, isFeatured: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('posts')
    .update({ is_featured: isFeatured })
    .eq('id', postId);

  if (!error) {
    revalidatePath('/admin');
    revalidatePath('/admin/content');
  }

  return { error };
}

export async function moderatePremiumRequest(requestId: string, status: 'approved' | 'rejected') {
  try {
    const supabase = await createClient();

    // Security check: Only admins can moderate requests
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Authentication required." };

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!adminProfile?.is_admin) return { error: "Unauthorized access." };

    // 1. Update the request status
    console.log(`[Admin] Updating premium request ${requestId} to ${status}...`);
    const { data: request, error: requestError } = await supabase
      .from('premium_requests')
      .update({
        status,
        approval_status: status,
        verification_status: status === 'approved' ? 'verified' : 'rejected',
        approved_at: status === 'approved' ? new Date().toISOString() : null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id
      })
      .eq('id', requestId)
      .select()
      .single();

    if (requestError) {
      console.error("[Admin] Error updating premium request:", {
        message: requestError.message,
        code: requestError.code,
        details: requestError.details
      });
      return { error: `Verification update failed: ${requestError.message}` };
    }

    console.log("[Admin] Premium request updated successfully:", request);

    // 2. If approved, upgrade the user's profile to verified creator
    if (status === 'approved') {
      console.log(`[Admin] Approving creator: ${request.user_id}`);
      const profileUpdate = {
        is_verified_creator: true,
        creator_verified: true,
        creator_status: 'approved',
        payment_status: 'verified',
        verification_status: 'verified',
        creator_approved_at: new Date().toISOString(),
        creator_since: new Date().toISOString(),
        creator_plan: 'premium'
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', request.user_id);

      if (profileError) {
        console.error('[Admin] Error updating profile to verified creator:', profileError);
        return { error: `Profile update failed: ${profileError.message}` };
      }

      // 3. Ensure creator_profiles record exists
      console.log("[Admin] Ensuring creator_profiles entry exists...");
      const { error: creatorProfileError } = await supabase
        .from('creator_profiles')
        .upsert({ id: request.user_id });

      if (creatorProfileError) {
        console.error('[Admin] Error creating creator profile:', creatorProfileError);
        // We don't fail the whole process for this optional table
      }

      console.log(`[Admin] Successfully approved creator request ${requestId} for user ${request.user_id}`);
    } else if (status === 'rejected') {
      console.log(`[Admin] Rejecting creator: ${request.user_id}`);
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_verified_creator: false,
          creator_verified: false,
          creator_status: 'rejected',
          payment_status: 'rejected',
          verification_status: 'rejected'
        })
        .eq('id', request.user_id);

      if (profileError) {
        console.error('[Admin] Error updating profile to rejected:', profileError);
        return { error: `Profile update failed: ${profileError.message}` };
      }

      console.log(`[Admin] Successfully rejected creator request ${requestId} for user ${request.user_id}`);
    }

    revalidatePath('/admin');
    revalidatePath('/admin/creators');
    revalidatePath('/feed');
    revalidatePath('/creator');

    return { error: null };
  } catch (err: any) {
    console.error("[Admin] Unexpected error in moderatePremiumRequest:", err);
    return { error: "A critical system error occurred during moderation." };
  }
}

export async function moderateSurvey(surveyId: string, status: 'open' | 'closed' | 'deleted') {
  const supabase = await createClient();

  if (status === 'deleted') {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', surveyId);
    if (!error) {
      revalidatePath('/admin');
      revalidatePath('/admin/surveys');
    }
    return { error };
  }

  const { error } = await supabase
    .from('surveys')
    .update({ status })
    .eq('id', surveyId);

  if (!error) {
    revalidatePath('/admin');
    revalidatePath('/admin/surveys');
  }

  return { error };
}

export async function suspendUser(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ is_suspended: true })
    .eq('id', userId);

  if (!error) {
    revalidatePath('/admin');
    revalidatePath('/admin/users');
  }
  return { error };
}

export async function banUser(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ is_banned: true })
    .eq('id', userId);

  if (!error) {
    revalidatePath('/admin');
    revalidatePath('/admin/users');
  }
  return { error };
}

export async function removeUser(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (!error) {
    revalidatePath('/admin');
    revalidatePath('/admin/users');
  }
  return { error };
}
