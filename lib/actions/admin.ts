"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Proactively ensures the required columns for creator approval exist in the profiles table.
 * This handles the "Could not find column" errors by attempting to create them and reloading the schema.
 * Only runs if the RPC exists and the user is an admin.
 */
async function ensureCreatorColumns(supabase: any) {
  try {
    const sql = `
      DO $$
      BEGIN
        -- Add columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
          ALTER TABLE public.profiles ADD COLUMN email TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'creator_approved') THEN
          ALTER TABLE public.profiles ADD COLUMN creator_approved BOOLEAN DEFAULT false;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'creator_approved_at') THEN
          ALTER TABLE public.profiles ADD COLUMN creator_approved_at TIMESTAMP WITH TIME ZONE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'approved_by') THEN
          ALTER TABLE public.profiles ADD COLUMN approved_by UUID;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'approval_status') THEN
          ALTER TABLE public.profiles ADD COLUMN approval_status TEXT DEFAULT 'pending';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'creator_status') THEN
          ALTER TABLE public.profiles ADD COLUMN creator_status TEXT DEFAULT 'pending';
        END IF;

        -- Reload PostgREST schema cache
        NOTIFY pgrst, 'reload schema';
      END $$;
    `;

    // Use the safer exec_sql_admin RPC
    const { error } = await supabase.rpc('exec_sql_admin', { sql_query: sql });
    if (error) {
      // It's normal for this to fail if the migration hasn't run or user isn't admin
      console.log('Schema sync info (expected if migration not yet applied):', error.message);
    }
  } catch (err) {
    console.error('Failed to sync schema:', err);
  }
}

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

    // Ensure schema is up to date - only once or when needed
    await ensureCreatorColumns(supabase);

    const { data: { user: adminUser } } = await supabase.auth.getUser();

    // 1. Update the request status
    const { data: request, error: requestError } = await supabase
      .from('premium_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single();

    if (requestError) return { error: requestError };

    // 2. Update user's profile with detailed approval data
    if (status === 'approved') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_verified_creator: true,
          creator_status: 'approved',
          approval_status: 'approved',
          creator_approved: true,
          creator_approved_at: new Date().toISOString(),
          approved_by: adminUser?.id
        })
        .eq('id', request.user_id);

      if (profileError) return { error: profileError };

      // 3. Ensure creator_profiles record exists
      const { error: creatorProfileError } = await supabase
        .from('creator_profiles')
        .upsert({ id: request.user_id })
        .eq('id', request.user_id);

      if (creatorProfileError) console.error('Error creating creator profile:', creatorProfileError);
    } else if (status === 'rejected') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_verified_creator: false,
          creator_status: 'rejected',
          approval_status: 'rejected',
          creator_approved: false
        })
        .eq('id', request.user_id);

      if (profileError) return { error: profileError };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/creators');
    revalidatePath('/feed');
    revalidatePath('/creator');
    return { error: null, success: true };
  } catch (error: any) {
    console.error('Moderate premium request failed:', error);
    return { error: { message: error.message || 'Verification sequence failed' }, success: false };
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
