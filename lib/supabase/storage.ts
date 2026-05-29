import { createClient } from './client';

export async function uploadFile(file: File, bucket: string) {
  try {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log(`[Storage] Starting upload to bucket: ${bucket}, path: ${filePath}`);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("[Storage] Upload Error:", error);
      if ((error as any).message?.includes('bucket not found') || (error as any).error === 'Bucket not found') {
        throw new Error(`Storage bucket "${bucket}" does not exist. Please create it in your Supabase Dashboard under Storage.`);
      }
      throw new Error(`Upload failed: ${error.message} (${(error as any).error || 'Error'})`);
    }

    console.log("[Storage] Upload successful, generating public URL...");

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error("Failed to generate public URL after upload.");
    }

    console.log("[Storage] Public URL generated:", publicUrl);
    return publicUrl;
  } catch (err: any) {
    console.error("[Storage] Fatal error in uploadFile:", err);
    throw err;
  }
}
