"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Survey, SurveyStats, SurveyQuestion, SurveyOption } from '@/lib/types/surveys';

export async function createSurvey(data: {
  title: string;
  description: string;
  category?: string;
  status?: 'draft' | 'published' | 'closed';
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { data: survey, error } = await supabase
    .from('surveys')
    .insert({
      creator_id: user.id,
      title: data.title,
      description: data.description,
      category: data.category || 'General',
      status: data.status || 'draft',
      settings: { anonymous: false, one_response_per_participant: true }
    })
    .select()
    .single();

  if (error) return { error };

  revalidatePath('/creator/surveys');
  revalidatePath('/creator');
  return { data: survey };
}

export async function getSurveyForBuilder(surveyId: string): Promise<{ data?: Survey, error?: any }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { data: survey, error: surveyError } = await supabase
    .from('surveys')
    .select(`
      *,
      questions:survey_questions(
        *,
        options:survey_options(*)
      )
    `)
    .eq('id', surveyId)
    .eq('creator_id', user.id)
    .order('order_index', { foreignTable: 'survey_questions', ascending: true })
    .order('order_index', { foreignTable: 'survey_questions.survey_options', ascending: true })
    .single();

  if (surveyError) return { error: surveyError };

  return { data: survey as Survey };
}

export async function updateSurveyDetails(surveyId: string, updates: Partial<Survey>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { data, error } = await supabase
    .from('surveys')
    .update(updates)
    .eq('id', surveyId)
    .eq('creator_id', user.id)
    .select()
    .single();

  if (error) return { error };

  revalidatePath(`/creator/surveys/${surveyId}/builder`);
  return { data };
}

export async function saveQuestion(surveyId: string, question: Partial<SurveyQuestion>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  // Validate ownership of survey
  const { data: survey } = await supabase
    .from('surveys')
    .select('id')
    .eq('id', surveyId)
    .eq('creator_id', user.id)
    .single();

  if (!survey) return { error: "Survey not found or access denied." };

  const { id, options, created_at, updated_at, ...questionData } = question as any;

  let result;
  if (id && !id.startsWith('temp-')) {
    result = await supabase
      .from('survey_questions')
      .update(questionData)
      .eq('id', id)
      .eq('survey_id', surveyId)
      .select()
      .single();
  } else {
    result = await supabase
      .from('survey_questions')
      .insert({ ...questionData, survey_id: surveyId })
      .select()
      .single();
  }

  if (result.error) return { error: result.error };
  return { data: result.data };
}

export async function deleteQuestion(surveyId: string, questionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { error } = await supabase
    .from('survey_questions')
    .delete()
    .eq('id', questionId)
    .eq('survey_id', surveyId);

  return { error };
}

export async function saveOption(questionId: string, option: Partial<SurveyOption>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { id, created_at, updated_at, ...optionData } = option as any;

  let result;
  if (id && !id.startsWith('temp-')) {
    result = await supabase
      .from('survey_options')
      .update(optionData)
      .eq('id', id)
      .eq('question_id', questionId)
      .select()
      .single();
  } else {
    result = await supabase
      .from('survey_options')
      .insert({ ...optionData, question_id: questionId })
      .select()
      .single();
  }

  if (result.error) return { error: result.error };
  return { data: result.data };
}

export async function deleteOption(questionId: string, optionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { error } = await supabase
    .from('survey_options')
    .delete()
    .eq('id', optionId)
    .eq('question_id', questionId);

  return { error };
}

export async function getCreatorSurveys(page: number = 1, pageSize: number = 10): Promise<{ data?: Survey[], count?: number, error?: any }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('surveys')
    .select('*, response_count:survey_responses(count)', { count: 'exact' })
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return { error };

  // Map response_count to a number
  const formattedData = data.map(s => ({
    ...s,
    response_count: (s as any).response_count?.[0]?.count || 0
  }));

  return { data: formattedData as Survey[], count: count || 0 };
}

export async function getSurveyStats(): Promise<{ data?: SurveyStats, error?: any }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { data: surveys, error } = await supabase
    .from('surveys')
    .select('status, response_count:survey_responses(count)')
    .eq('creator_id', user.id);

  if (error) return { error };

  const stats = {
    total: surveys.length,
    active: surveys.filter(s => s.status === 'published').length,
    draft: surveys.filter(s => s.status === 'draft').length,
    closed: surveys.filter(s => s.status === 'closed').length,
    totalResponses: surveys.reduce((acc, s) => acc + ((s as any).response_count?.[0]?.count || 0), 0)
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
    .eq('creator_id', user.id)
    .select()
    .single();

  if (error) return { error };

  if (status === 'published') {
    await supabase.from('posts').upsert({
      author_id: user.id,
      title: data.title,
      content: data.description || '',
      post_type: 'survey',
      status: 'approved',
      media_url: data.cover_image || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1000"
    }, { onConflict: 'author_id, title' });
  } else {
    await supabase.from('posts')
      .delete()
      .eq('author_id', user.id)
      .eq('title', data.title)
      .eq('post_type', 'survey');
  }

  revalidatePath('/creator/surveys');
  revalidatePath('/creator');
  revalidatePath(`/creator/surveys/${surveyId}/builder`);
  return { data };
}

export async function duplicateSurvey(surveyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { data: existingSurvey, error: fetchError } = await supabase
    .from('surveys')
    .select(`
      *,
      questions:survey_questions(
        *,
        options:survey_options(*)
      )
    `)
    .eq('id', surveyId)
    .eq('creator_id', user.id)
    .single();

  if (fetchError || !existingSurvey) return { error: "Survey not found." };

  const { id, created_at, updated_at, questions, ...surveyData } = existingSurvey as any;

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

  // Duplicate questions and options
  for (const q of (questions || [])) {
    const { id: oldQid, created_at: qca, updated_at: qua, options, ...qData } = q;
    const { data: newQ, error: qError } = await supabase
      .from('survey_questions')
      .insert({ ...qData, survey_id: newSurvey.id })
      .select()
      .single();

    if (!qError && options) {
      for (const o of options) {
        const { id: oldOid, created_at: oca, updated_at: oua, ...oData } = o;
        await supabase.from('survey_options').insert({ ...oData, question_id: newQ.id });
      }
    }
  }

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
    .eq('creator_id', user.id);

  if (error) return { error };

  revalidatePath('/creator/surveys');
  revalidatePath('/creator');
  return { success: true };
}

export async function submitSurveyResponse(surveyId: string, answers: Record<string, any>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If anonymous mode is disabled in settings, require auth
  const { data: survey } = await supabase
    .from('surveys')
    .select('settings')
    .eq('id', surveyId)
    .single();

  if (survey?.settings?.anonymous === false && !user) {
    return { error: "Authentication required for this survey." };
  }

  const { data, error } = await supabase
    .from('survey_responses')
    .insert({
      survey_id: surveyId,
      participant_id: user?.id || null,
      responses: answers
    })
    .select()
    .single();

  if (error) return { error };

  return { data };
}
