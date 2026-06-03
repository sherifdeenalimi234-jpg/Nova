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

  if (projectError) {
    console.error('[createProject] Error inserting project:', projectError);
    return { error: projectError.message };
  }

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

  // Activity Feed Integration
  if (formData.visibility === 'Public') {
    await supabase.from('activity_feed').insert({
      user_id: user.id,
      action: 'LAUNCHED NEW PROJECT',
      entity_id: project.id,
      entity_type: 'project'
    });
  }

  revalidatePath('/projects');
  revalidatePath('/projects/explore');
  revalidatePath('/feed');

  return { data: project, error: null };
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
    // Activity Feed Integration for Visibility Changes
    if (formData.visibility === 'Public') {
      await supabase.from('activity_feed').insert({
        user_id: user.id,
        action: 'UPDATED PROJECT SPECS',
        entity_id: projectId,
        entity_type: 'project'
      });
    }

    revalidatePath('/projects');
    revalidatePath('/projects/explore');
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/workspace`);
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
    revalidatePath('/projects/explore');
    revalidatePath('/feed');
  }

  return { error };
}

export async function getProject(projectIdOrSlug: string) {
  const supabase = await createClient();

  // Explicitly get user to ensure session is active in this server context
  const { data: { user } } = await supabase.auth.getUser();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectIdOrSlug);

  let query = supabase
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
    `);

  if (isUuid) {
    query = query.eq('id', projectIdOrSlug);
  } else {
    query = query.eq('slug', projectIdOrSlug);
  }

  const { data, error } = await query.single();

  if (!error && data) {
    // Fetch counts for statistics
    const { count: activityCount } = await supabase
      .from('activity_feed')
      .select('*', { count: 'exact', head: true })
      .eq('entity_id', data.id);

    const { count: updateCount } = await supabase
      .from('activity_feed')
      .select('*', { count: 'exact', head: true })
      .eq('entity_id', data.id)
      .ilike('action', '%UPDATE%');

    data.stats = {
      activities: activityCount || 0,
      updates: updateCount || 0,
      files: 0
    };
  }

  if (error) {
    console.error(`[getProject] Error fetching project ${projectIdOrSlug}:`, error.message);
  }

  return { data, error };
}

export async function getCreatorProjects() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: [], error: "Authentication required." };

  // Fetch projects where user is either the creator OR a member
  // Using a join to ensure we get projects the user is involved in
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_members!inner (user_id),
      all_members:project_members (count)
    `)
    .eq('project_members.user_id', user.id)
    .order('created_at', { ascending: false });

  // Map the data to maintain the expected structure (project_members count)
  const mappedData = data?.map(project => ({
    ...project,
    project_members: project.all_members
  })) || [];

  return { data: mappedData, error };
}

export async function archiveProject(projectId: string) {
  return updateProject(projectId, { status: 'Archived' });
}
