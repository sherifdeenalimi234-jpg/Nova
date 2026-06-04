import { createClient } from './server';

export async function getProfile(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      creator_profiles (*)
    `)
    .eq('id', id)
    .single();

  return { data, error };
}

export async function getProfileByUsername(username: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      creator_profiles (*),
      projects (*)
    `)
    .eq('custom_url', username)
    .single();

  // Filter projects for public view if the request is not from the owner
  if (data && data.projects) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id !== data.id) {
      data.projects = data.projects.filter((p: any) => p.visibility === 'Public');
    }
  }

  return { data, error };
}

export async function updateProfile(id: string, updates: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}
