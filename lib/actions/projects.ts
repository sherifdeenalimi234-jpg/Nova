"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createProject(formData: {
  title: string;
  short_description: string;
  full_description: string;
  category: string;
  visibility: 'Public' | 'Team Only' | 'Private';
  project_type: 'Live Project' | 'Showcase Project';
  tags?: string[];
  cover_image?: string;
  banner_image?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const slug = formData.title.toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      creator_id: user.id,
      title: formData.title,
      slug: `${slug}-${Math.random().toString(36).substring(2, 7)}`,
      short_description: formData.short_description,
      full_description: formData.full_description,
      category: formData.category,
      visibility: formData.visibility,
      project_type: formData.project_type,
      tags: formData.tags || [],
      cover_image: formData.cover_image,
      banner_image: formData.banner_image,
      status: 'Active'
    })
    .select()
    .single();

  if (projectError) return { error: projectError.message };

  // Automatically add creator as Owner
  const { error: memberError } = await supabase
    .from('project_members')
    .insert({
      project_id: project.id,
      user_id: user.id,
      role: 'Owner'
    });

  if (memberError) {
    // Cleanup if member insertion fails
    await supabase.from('projects').delete().eq('id', project.id);
    return { error: memberError.message };
  }

  revalidatePath('/projects');
  revalidatePath('/creator/projects');
  revalidatePath('/feed');

  // Verify records exist
  const { data: verifyProject } = await supabase
    .from('projects')
    .select('id, slug')
    .eq('id', project.id)
    .single();

  const { data: verifyMember } = await supabase
    .from('project_members')
    .select('id')
    .eq('project_id', project.id)
    .eq('user_id', user.id)
    .single();

  if (!verifyProject || !verifyMember) {
    return { error: "Verification failed: Project or membership record not found after creation." };
  }

  // If public, generate a feed post
  if (formData.visibility === 'Public') {
    await supabase.from('posts').insert({
      author_id: user.id,
      title: formData.title,
      content: formData.short_description,
      post_type: 'project',
      status: 'approved',
      media_url: formData.cover_image || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000"
    });
  }

  return { data: verifyProject, error: null };
}

export async function updateProject(projectId: string, formData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { data, error } = await supabase
    .from('projects')
    .update(formData)
    .eq('id', projectId)
    .select()
    .single();

  if (!error) {
    revalidatePath('/projects');
    revalidatePath('/creator/projects');
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/creator/projects/${projectId}/workspace`);
    revalidatePath('/feed');
  }

  return { data, error };
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (!error) {
    revalidatePath('/projects');
    revalidatePath('/creator/projects');
    revalidatePath('/feed');
  }

  return { error };
}

export async function getProject(projectId: string) {
  const supabase = await createClient();

  // Explicitly get user to ensure session is active in this server context
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_members (
        *,
        profiles (
          full_name,
          avatar_url,
          email
        )
      )
    `)
    .eq('id', projectId)
    .single();

  if (error) {
    console.error(`[getProject] Error fetching project ${projectId}:`, error.message);
  }

  return { data, error };
}

export async function getCreatorProjects() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: [], error: "Authentication required." };

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_members (count)
    `)
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function archiveProject(projectId: string) {
  return updateProject(projectId, { status: 'Archived' });
}
