"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createInitialSurvey() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required");

  const { data, error } = await supabase
    .from('surveys')
    .insert({
      creator_id: user.id,
      title: 'Untitled Survey',
      description: '',
      status: 'draft',
      category: 'General'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSurveyMetadata(surveyId: string, updates: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required");

  const { error } = await supabase
    .from('surveys')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', surveyId)
    .eq('creator_id', user.id);

  if (error) throw error;
  return { success: true };
}

export async function syncQuestions(surveyId: string, questions: any[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required");

  // Verify ownership
  const { data: survey } = await supabase
    .from('surveys')
    .select('id')
    .eq('id', surveyId)
    .eq('creator_id', user.id)
    .single();

  if (!survey) throw new Error("Unauthorized");

  // Surgical Sync Logic to preserve data integrity and prevent cascading deletes of responses

  // 1. Get existing questions for this survey
  const { data: existingQuestions } = await supabase
    .from('survey_questions')
    .select('id')
    .eq('survey_id', surveyId);

  const existingQIds = existingQuestions?.map(q => q.id) || [];
  const currentQIds = questions.filter(q => !q.id.startsWith('temp-')).map(q => q.id);

  // 2. Identify questions to delete (those in DB but not in the current list)
  const qIdsToDelete = existingQIds.filter(id => !currentQIds.includes(id));
  if (qIdsToDelete.length > 0) {
    await supabase.from('survey_questions').delete().in('id', qIdsToDelete);
  }

  // 3. Process each question (Update or Insert)
  for (const [qIdx, q] of questions.entries()) {
    const isNew = q.id.startsWith('temp-');

    const qData = {
      survey_id: surveyId,
      type: q.type,
      question_text: q.question_text,
      description: q.description || '',
      order_index: qIdx,
      is_required: q.is_required ?? true,
      placeholder: q.placeholder || '',
      validation_rules: q.validation_rules || {}
    };

    let qId = q.id;

    if (isNew) {
      const { data: newQ, error: qError } = await supabase
        .from('survey_questions')
        .insert(qData)
        .select()
        .single();
      if (qError) throw qError;
      qId = newQ.id;
    } else {
      const { error: qError } = await supabase
        .from('survey_questions')
        .update(qData)
        .eq('id', q.id);
      if (qError) throw qError;
    }

    // 4. Surgical Sync for Options
    if (['single_choice', 'multiple_choice', 'dropdown'].includes(q.type)) {
      const { data: existingOptions } = await supabase
        .from('survey_options')
        .select('id')
        .eq('question_id', qId);

      const existingOptIds = existingOptions?.map(o => o.id) || [];
      const currentOpts = q.options || [];
      const currentOptIds = currentOpts.filter((o: any) => o.id && !String(o.id).startsWith('temp-')).map((o: any) => o.id);

      // Delete removed options
      const optIdsToDelete = existingOptIds.filter(id => !currentOptIds.includes(id));
      if (optIdsToDelete.length > 0) {
        await supabase.from('survey_options').delete().in('id', optIdsToDelete);
      }

      // Update or Insert options
      for (const [oIdx, opt] of currentOpts.entries()) {
        const isOptNew = !opt.id || String(opt.id).startsWith('temp-');
        const optData = {
          question_id: qId,
          option_text: typeof opt === 'string' ? opt : opt.option_text,
          order_index: oIdx
        };

        if (isOptNew) {
          await supabase.from('survey_options').insert(optData);
        } else {
          await supabase.from('survey_options').update(optData).eq('id', opt.id);
        }
      }
    }
  }

  return { success: true };
}

export async function validateSurvey(surveyId: string) {
  const supabase = await createClient();

  const { data: survey, error: sError } = await supabase
    .from('surveys')
    .select('*, survey_questions(*, survey_options(*))')
    .eq('id', surveyId)
    .single();

  if (sError) throw sError;

  const errors = [];
  if (!survey.title || survey.title === 'Untitled Survey') errors.push("Survey title is required.");
  if (survey.survey_questions.length === 0) errors.push("At least one question is required.");

  for (const q of survey.survey_questions) {
    if (!q.question_text) errors.push(`Question #${q.order_index + 1} text is missing.`);
    if (['single_choice', 'multiple_choice', 'dropdown'].includes(q.type)) {
      if (q.survey_options.length < 2) errors.push(`Question #${q.order_index + 1} requires at least two options.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function getSurveyForEdit(surveyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required");

  const { data, error } = await supabase
    .from('surveys')
    .select('*, survey_questions(*, survey_options(*))')
    .eq('id', surveyId)
    .eq('creator_id', user.id)
    .order('order_index', { foreignTable: 'survey_questions', ascending: true })
    .order('order_index', { foreignTable: 'survey_questions.survey_options', ascending: true })
    .single();

  if (error) throw error;

  // Format the data for the frontend builder
  return {
    ...data,
    questions: data.survey_questions.map((q: any) => ({
      ...q,
      options: q.survey_options
    }))
  };
}
