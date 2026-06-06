"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createBlueprint(data: {
  name: string;
  objective: string;
  linkedProject: string;
  audience: string[];
  targetResponses: number;
  duration: string;
  visibility: string;
  isAnonymous: boolean;
  collectIdentity: boolean;
  advanced: any;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required." };

  // 1. Validate (Simple check)
  if (!data.name || !data.objective) {
    return { success: false, error: "Validation failed: Name and Objective are required." };
  }

  // 2. Create Survey Record
  const { data: survey, error } = await supabase
    .from('surveys')
    .insert({
      creator_id: user.id,
      title: data.name,
      description: data.objective,
      questions: [], // Workspace starts with no questions
      target_audience: data.audience,
      target_responses: data.targetResponses,
      estimated_duration: data.duration,
      visibility: data.visibility,
      anonymous_responses: data.isAnonymous,
      collect_identity: data.collectIdentity,
      advanced_settings: data.advanced,
      status: 'open'
    })
    .select('id')
    .single();

  if (error) {
    console.error("Survey creation error:", error);
    return { success: false, error: error.message };
  }

  // 3. Optional: Create Activity Feed entry
  await supabase.from('activity_feed').insert({
    user_id: user.id,
    action: 'initialized_blueprint',
    entity_id: survey.id,
    entity_type: 'survey'
  });

  revalidatePath('/surveys');

  return { success: true, id: survey.id };
}
