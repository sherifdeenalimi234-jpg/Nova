"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Survey, SurveyStats } from '@/lib/types/surveys';

export async function createSurvey(data: {
  title: string;
  description: string;
  questions: any[];
  category?: string;
  status?: 'draft' | 'published' | 'closed';
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
      category: data.category || 'General',
      status: data.status || 'draft'
    })
    .select()
    .single();

  if (error) return { error };

  // Also create a post for the feed if published
  if (data.status === 'published') {
    const { error: postError } = await supabase.from('posts').insert({
      author_id: user.id,
      title: data.title,
      content: data.description,
      post_type: 'survey',
      status: 'approved',
      media_url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1000"
    });

    if (postError) {
      console.error('[createSurvey] Discovery post creation failed:', postError);
    }
  }

  revalidatePath('/creator/surveys');
  revalidatePath('/creator');
  return { data: survey };
}

export async function getCreatorSurveys(page: number = 1, pageSize: number = 10): Promise<{ data?: Survey[], count?: number, error?: any }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('surveys')
    .select('*, survey_responses(count)', { count: 'exact' })
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return { error };

  return { data: data as Survey[], count: count || 0 };
}

export async function getSurveyStats(): Promise<{ data?: SurveyStats, error?: any }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { data: surveys, error } = await supabase
    .from('surveys')
    .select('status, survey_responses(count)')
    .eq('creator_id', user.id);

  if (error) return { error };

  const stats = {
    total: surveys.length,
    active: surveys.filter(s => s.status === 'published').length,
    draft: surveys.filter(s => s.status === 'draft').length,
    closed: surveys.filter(s => s.status === 'closed').length,
    totalResponses: surveys.reduce((acc, s) => acc + (s.survey_responses?.[0]?.count || 0), 0)
  };

  return { data: stats };
}

export async function updateSurveyStatus(surveyId: string, status: 'draft' | 'published' | 'closed') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { data, error } = await supabase
    .from('surveys')
    .update({ status })
    .eq('id', surveyId)
    .eq('creator_id', user.id) // Ownership validation
    .select()
    .single();

  if (error) return { error };

  // Handle Feed Integration for status updates
  if (status === 'published') {
    // Upsert discovery post
    await supabase.from('posts').upsert({
      author_id: user.id,
      title: data.title, // Title might have changed, but upsert on title is risky if not unique
      content: data.description,
      post_type: 'survey',
      status: 'approved',
      media_url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1000"
    }, { onConflict: 'author_id, title' });
  } else {
    // If unpublished or closed, we could delete the post,
    // but the 'posts' table doesn't have a direct link to survey_id.
    // For now, we'll leave it as is or handle it by title match.
    await supabase.from('posts')
      .delete()
      .eq('author_id', user.id)
      .eq('title', data.title)
      .eq('post_type', 'survey');
  }

  revalidatePath('/creator/surveys');
  revalidatePath('/creator');
  return { data };
}

export async function duplicateSurvey(surveyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { data: existingSurvey, error: fetchError } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', surveyId)
    .eq('creator_id', user.id)
    .single();

  if (fetchError || !existingSurvey) return { error: "Survey not found." };

  const { id, created_at, updated_at, ...surveyData } = existingSurvey;

  const { data: newSurvey, error: insertError } = await supabase
    .from('surveys')
    .insert({
      ...surveyData,
      title: `${existingSurvey.title} (Copy)`,
      status: 'draft'
    })
    .select()
    .single();

  if (insertError) return { error: insertError };

  revalidatePath('/creator/surveys');
  revalidatePath('/creator');
  return { data: newSurvey };
}

export async function deleteSurvey(surveyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { error } = await supabase
    .from('surveys')
    .delete()
    .eq('id', surveyId)
    .eq('creator_id', user.id); // Ownership validation

  if (error) return { error };

  revalidatePath('/creator/surveys');
  revalidatePath('/creator');
  return { success: true };
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
