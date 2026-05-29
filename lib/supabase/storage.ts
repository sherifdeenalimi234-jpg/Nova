import { createClient } from './client';

export async function uploadFile(file: File, bucket: string) {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) {
    if ((error as any).message?.includes('bucket not found') || (error as any).error === 'Bucket not found') {
      throw new Error(`Storage bucket "${bucket}" does not exist. Please create it in your Supabase Dashboard under Storage.`);
    }
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}
