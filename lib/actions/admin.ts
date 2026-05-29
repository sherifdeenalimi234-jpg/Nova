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
  const { data: request, error: requestError } = await supabase
    .from('premium_requests')
    .update({
      status,
      approved_at: status === 'approved' ? new Date().toISOString() : null
    })
    .eq('id', requestId)
    .select()
    .single();

  if (requestError) return { error: requestError };

  // 2. If approved, upgrade the user's profile to verified creator
  if (status === 'approved') {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        is_verified_creator: true,
        creator_status: 'approved',
        payment_status: 'verified',
        creator_approved_at: new Date().toISOString()
      })
      .eq('id', request.user_id);

    if (profileError) return { error: profileError };

    // 3. Ensure creator_profiles record exists
    const { error: creatorProfileError } = await supabase
      .from('creator_profiles')
      .upsert({ id: request.user_id });

    if (creatorProfileError) console.error('Error creating creator profile:', creatorProfileError);
  } else if (status === 'rejected') {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        is_verified_creator: false,
        creator_status: 'rejected',
        payment_status: 'rejected'
      })
      .eq('id', request.user_id);

    if (profileError) return { error: profileError };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/creators');
  revalidatePath('/feed');
  revalidatePath('/creator');
  return { error: null };
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
