"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: {
  title: string;
  content: string;
  post_type: string;
  media_url?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  // Check if user is creator or admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verified_creator, is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_verified_creator && !profile?.is_admin) {
    return { error: "Creator privileges required to publish." };
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      title: formData.title,
      content: formData.content,
      post_type: formData.post_type,
      media_url: formData.media_url,
      status: 'pending' // Posts must be approved by admin
    })
    .select()
    .single();

  if (!error) {
    revalidatePath('/');
    revalidatePath('/admin');
  }

  return { data, error };
}
