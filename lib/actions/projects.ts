"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createProject(formData: {
  title: string;
  description: string;
  thumbnail_url?: string;
  media_urls?: string[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { data, error } = await supabase
    .from('projects')
    .insert({
      creator_id: user.id,
      title: formData.title,
      description: formData.description,
      thumbnail_url: formData.thumbnail_url,
      media_urls: formData.media_urls || []
    })
    .select()
    .single();

  if (!error) {
    revalidatePath('/creator/projects');
    revalidatePath(`/u/${user.id}`);
  }

  return { data, error };
}
