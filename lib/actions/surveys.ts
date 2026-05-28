"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createSurvey(data: {
  title: string;
  description: string;
  questions: any[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  // Create the survey record
  const { data: survey, error } = await supabase
    .from('surveys')
    .insert({
      creator_id: user.id,
      title: data.title,
      description: data.description,
      questions: data.questions,
      status: 'open'
    })
    .select()
    .single();

  if (error) return { error };

  // Also create a post for the feed
  await supabase.from('posts').insert({
    author_id: user.id,
    title: data.title,
    content: data.description,
    post_type: 'survey',
    status: 'approved', // Surveys by creators are auto-approved for this phase?
    // Or maybe they also go through moderation. Let's keep status pending to be consistent.
    media_url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1000"
  });

  revalidatePath('/');
  return { data: survey };
}

export async function submitSurveyResponse(surveyId: string, answers: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { error } = await supabase
    .from('survey_responses')
    .insert({
      survey_id: surveyId,
      user_id: user.id,
      answers: answers
    });

  return { error };
}
