"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCreatorDashboardStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required");

  // Fetch counts
  const { data: surveys, error } = await supabase
    .from('surveys')
    .select('status, id')
    .eq('creator_id', user.id);

  if (error) throw error;

  const total = surveys.length;
  const active = surveys.filter(s => s.status === 'published').length;
  const drafts = surveys.filter(s => s.status === 'draft').length;

  // Total responses
  const { count: responseCount, error: respError } = await supabase
    .from('survey_responses')
    .select('*', { count: 'exact', head: true })
    .in('survey_id', surveys.map(s => s.id));

  if (respError && total > 0) throw respError;

  return {
    total,
    active,
    drafts,
    responses: responseCount || 0
  };
}

export async function getCreatorSurveys(filters: { status?: string; search?: string } = {}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required");

  let query = supabase
    .from('surveys')
    .select('*, survey_responses(count)')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false });

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map(s => ({
    ...s,
    response_count: s.survey_responses?.[0]?.count || 0
  }));
}

export async function updateSurveyStatus(surveyId: string, status: 'draft' | 'published' | 'closed') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required");

  const { error } = await supabase
    .from('surveys')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', surveyId)
    .eq('creator_id', user.id);

  if (error) throw error;

  revalidatePath('/survey/dashboard');
  revalidatePath('/survey/manage');
  return { success: true };
}

export async function duplicateSurvey(surveyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required");

  // 1. Fetch original survey
  const { data: original, error: fetchError } = await supabase
    .from('surveys')
    .select('*, survey_questions(*, survey_options(*))')
    .eq('id', surveyId)
    .eq('creator_id', user.id)
    .single();

  if (fetchError) throw fetchError;

  // 2. Create new survey record
  const { data: newSurvey, error: createError } = await supabase
    .from('surveys')
    .insert({
      creator_id: user.id,
      title: `${original.title} (Copy)`,
      description: original.description,
      status: 'draft',
      category: original.category
    })
    .select()
    .single();

  if (createError) throw createError;

  // 3. Duplicate questions and options
  for (const q of original.survey_questions) {
    const { data: newQ, error: qError } = await supabase
      .from('survey_questions')
      .insert({
        survey_id: newSurvey.id,
        type: q.type,
        question_text: q.question_text,
        order_index: q.order_index,
        is_required: q.is_required
      })
      .select()
      .single();

    if (qError) throw qError;

    if (q.survey_options && q.survey_options.length > 0) {
      const optionsToInsert = q.survey_options.map((o: any) => ({
        question_id: newQ.id,
        option_text: o.option_text,
        order_index: o.order_index
      }));

      const { error: oError } = await supabase.from('survey_options').insert(optionsToInsert);
      if (oError) throw oError;
    }
  }

  revalidatePath('/survey/dashboard');
  revalidatePath('/survey/manage');
  return { success: true };
}

export async function deleteSurvey(surveyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required");

  const { error } = await supabase
    .from('surveys')
    .delete()
    .eq('id', surveyId)
    .eq('creator_id', user.id);

  if (error) throw error;

  revalidatePath('/survey/dashboard');
  revalidatePath('/survey/manage');
  return { success: true };
}

export async function getRecentActivity() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required");

  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('creator_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(5);

  if (error) throw error;
  return data;
}
