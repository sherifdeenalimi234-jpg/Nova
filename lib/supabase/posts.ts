import { createClient } from './server';

export async function getApprovedPosts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(full_name, avatar_url)
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  return { data, error };
}
