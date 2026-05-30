"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ADMIN_EMAIL } from '@/lib/constants';

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

export async function moderatePremiumRequest(requestId: string, status: 'approved' | 'rejected', adminNote?: string) {
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

    const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || adminProfile?.is_admin;
    if (!isAdmin) return { error: "Unauthorized access." };

    console.log(`[Admin] Initiating moderation workflow for ${requestId} -> ${status}`);

    // 1. Update the request status in premium_requests
    const requestUpdates: any = {
      status,
      approval_status: status,
      verification_status: status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      admin_note: adminNote || null
    };

    if (status === 'approved') {
      requestUpdates.approved_at = new Date().toISOString();
    }

    const { data: request, error: requestError } = await supabase
      .from('premium_requests')
      .update(requestUpdates)
      .eq('id', requestId)
      .select()
      .single();

    if (requestError) {
      console.error("[Admin] Error updating premium_requests:", requestError);
      return { error: `Database update failed: ${requestError.message}` };
    }

    // 2. Update the user's profile
    const profileUpdates: any = {
      creator_verified: status === 'approved',
      is_verified_creator: status === 'approved',
      creator_status: status,
      verification_status: status,
      payment_status: status === 'approved' ? 'verified' : 'rejected',
      updated_at: new Date().toISOString()
    };

    if (status === 'approved') {
      profileUpdates.creator_since = new Date().toISOString();
      profileUpdates.creator_approved_at = new Date().toISOString();
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', request.user_id);

    if (profileError) {
      console.error('[Admin] Error updating profile:', profileError);
      return { error: `Profile synchronization failed: ${profileError.message}` };
    }

    // 3. Ensure creator_profiles record exists if approved
    if (status === 'approved') {
      const { error: creatorProfileError } = await supabase
        .from('creator_profiles')
        .upsert({ id: request.user_id });

      if (creatorProfileError) {
        console.error('[Admin] Error upserting creator_profile:', creatorProfileError);
      }
    }

    console.log(`[Admin] Moderation workflow completed for user ${request.user_id}`);

    revalidatePath('/admin');
    revalidatePath('/admin/creators');
    revalidatePath('/feed');
    revalidatePath('/creator');

    return { error: null };
  } catch (err: any) {
    console.error("[Admin] Critical failure in moderatePremiumRequest:", err);
    return { error: "System malfunction during moderation sequence." };
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

export async function getWhitelist() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('creator_whitelist')
    .select('*')
    .order('added_at', { ascending: false });

  return { data, error };
}

export async function addToWhitelist(email: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('creator_whitelist')
    .insert({ email: email.toLowerCase(), added_by: user?.id })
    .select();

  if (!error) {
    revalidatePath('/admin/whitelist');
  }

  return { data, error };
}

export async function removeFromWhitelist(email: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('creator_whitelist')
    .delete()
    .eq('email', email.toLowerCase());

  if (!error) {
    revalidatePath('/admin/whitelist');
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
