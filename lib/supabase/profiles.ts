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
      creator_profiles (*)
    `)
    .eq('custom_url', username)
    .single();

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
