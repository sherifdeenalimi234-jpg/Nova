"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createProject(formData: {
  title: string;
  short_description: string;
  full_description: string;
  category: string;
  visibility: 'Public' | 'Private';
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

  // Ecosystem Discovery Integration (Public Projects Only)
  if (formData.visibility === 'Public') {
    // 1. Activity Feed Entry
    await supabase.from('activity_feed').insert({
      user_id: user.id,
      action: 'LAUNCHED NEW PROJECT',
      entity_id: project.id,
      entity_type: 'project'
    });

    // 2. Automatic Ecosystem Post (Discovery Signal)
    // This allows the project to appear in the main Feed and RingSystem
    // Status defaults to 'approved' in the database
    await supabase.from('posts').insert({
      author_id: user.id,
      title: project.title,
      content: project.short_description + `\n\n[Project ID: ${project.id}]`,
      post_type: 'project',
      media_url: project.cover_image
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
    revalidatePath(`/project-space/${projectId}`);
    revalidatePath(`/project-space/${projectId}/workspace`);
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

/**
 * getProject with robust trace logging and recursion-safe querying
 */
export async function getProject(projectIdOrSlug: string) {
  const trace: any = {
    step: 'START',
    input: projectIdOrSlug,
    timestamp: new Date().toISOString(),
    authUserId: null,
    isUuid: false,
    results: {
      project: 'NOT_ATTEMPTED',
      members: 'NOT_ATTEMPTED',
      stats: 'NOT_ATTEMPTED'
    }
  };

  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    trace.authUserId = authData?.user?.id || 'GUEST';
    trace.step = 'AUTH_OK';

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectIdOrSlug);
    trace.isUuid = isUuid;

    // STEP 1: Fetch Project (Flat query to avoid join-induced RLS recursion)
    let query = supabase.from('projects').select('*');
    if (isUuid) {
      query = query.eq('id', projectIdOrSlug);
    } else {
      query = query.eq('slug', projectIdOrSlug);
    }

    const { data: project, error: projectError, status } = await query.maybeSingle();
    trace.results.project = project ? 'FOUND' : 'NULL';
    trace.projectStatus = status;

    if (projectError) {
      trace.projectError = projectError;
      return { data: null, error: projectError, debug: trace };
    }

    if (!project) {
      trace.step = 'PROJECT_NOT_FOUND';
      return { data: null, error: null, debug: trace };
    }

    // STEP 2: Fetch Members separately (Bypasses join recursion)
    const { data: members, error: membersError } = await supabase
      .from('project_members')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('project_id', project.id);

    trace.results.members = members ? `FOUND_${members.length}` : 'NULL';
    project.project_members = members || [];

    // STEP 3: Fetch Stats
    const { count: activityCount } = await supabase
      .from('activity_feed')
      .select('*', { count: 'exact', head: true })
      .eq('entity_id', project.id);

    const { count: updateCount } = await supabase
      .from('activity_feed')
      .select('*', { count: 'exact', head: true })
      .eq('entity_id', project.id)
      .ilike('action', '%UPDATE%');

    project.stats = {
      activities: activityCount || 0,
      updates: updateCount || 0,
      files: 0
    };
    trace.results.stats = 'OK';
    trace.step = 'SUCCESS';

    return { data: project, error: null, debug: trace };
  } catch (fatal: any) {
    trace.step = 'FATAL';
    trace.fatalError = fatal.message;
    return { data: null, error: { message: fatal.message }, debug: trace };
  }
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
