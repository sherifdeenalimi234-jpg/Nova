"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Survey, SurveyStats, SurveyQuestion, SurveyOption, SurveySection } from '@/lib/types/surveys';

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
      settings: { anonymous: false, one_response_per_participant: true },
      legacy_questions: []
    })
    .select()
    .single();

  if (error) return { error };

  revalidatePath('/creator-surveys');
  revalidatePath('/creator');
  return { data: survey };
}

export async function createSurveyWorkspace(data: {
  title: string;
  research_objective: string;
  project_id: string | null;
  survey_mode: string;
  target_audience: string;
  target_responses: string;
  visibility: string;
  estimated_duration?: string;
  research_category?: string;
  tags?: string[];
  language?: string;
  research_timeline?: string;
  research_notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required." };

  const requiredFields = [
    'title',
    'research_objective',
    'project_id',
    'survey_mode',
    'target_audience',
    'target_responses',
    'visibility'
  ];

  for (const field of requiredFields) {
    if (!data[field as keyof typeof data]) {
      return { success: false, error: `Validation failed: ${field} is required.` };
    }
  }

  const insertData: any = {
    creator_id: user.id,
    title: data.title,
    research_objective: data.research_objective,
    project_id: data.project_id,
    survey_mode: data.survey_mode,
    target_audience: data.target_audience,
    target_responses: data.target_responses,
    visibility: data.visibility,
    estimated_duration: data.estimated_duration,
    research_category: data.research_category,
    tags: data.tags || [],
    language: data.language || 'English',
    research_timeline: data.research_timeline,
    research_notes: data.research_notes,
    status: 'draft',
    legacy_questions: []
  };

  const { data: survey, error } = await supabase
    .from('surveys')
    .insert(insertData)
    .select('id')
    .single();

  let finalId = survey?.id;
  let warning = null;

  if (error) {
    console.error("[createSurveyWorkspace] Primary Insert Failed:", error);
    if (error.code === '42703' || error.message?.includes('column')) {
       const { data: fallbackSurvey, error: fallbackError } = await supabase
         .from('surveys')
         .insert({
           creator_id: user.id,
           title: data.title,
           status: 'draft'
         })
         .select('id')
         .single();

       if (fallbackError) return { success: false, error: fallbackError.message };
       finalId = fallbackSurvey.id;
       warning = "Some blueprint fields could not be saved due to schema mismatch.";
    } else {
      return { success: false, error: error.message };
    }
  }

  if (!finalId) return { success: false, error: "Failed to establish research node ID." };

  try {
    await supabase.from('activity_feed').insert({
      user_id: user.id,
      action: 'INITIALIZED BLUEPRINT WORKSPACE',
      entity_id: finalId,
      entity_type: 'survey'
    });
  } catch (feedErr) {}

  revalidatePath('/creator-surveys');
  revalidatePath(`/creator-surveys/${finalId}`);

  return { success: true, id: finalId, warning };
}

export async function getSurveyForBuilder(surveyId: string): Promise<{ data?: Survey, error?: any }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: { message: "Authentication required.", code: 'AUTH_REQUIRED' } };

    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .eq('creator_id', user.id)
      .single();

    if (surveyError) return { error: surveyError };
    if (!survey) return { error: { message: "Node not found.", code: 'NOT_FOUND' } };

    let sectionsData: any[] = [];
    let questionsData: any[] = [];

    const { data: sData, error: sError } = await supabase
      .from('survey_sections')
      .select('*')
      .eq('survey_id', surveyId)
      .order('order_index', { ascending: true });

    if (!sError && sData) sectionsData = sData;

    const { data: qData, error: qError } = await supabase
      .from('survey_questions')
      .select('*, survey_options(*)')
      .eq('survey_id', surveyId)
      .order('order_index', { ascending: true });

    if (!qError && qData) {
      questionsData = qData.map((q: any) => ({
        ...q,
        options: q.survey_options || []
      }));
    }

    const result = {
      ...survey,
      sections: sectionsData,
      questions: questionsData,
      tags: survey.tags || [],
      settings: survey.settings || { anonymous: false, one_response_per_participant: true },
      category: survey.category || 'General',
      status: survey.status || 'draft'
    };

    return JSON.parse(JSON.stringify({ data: result as Survey }, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  } catch (err: any) {
    return { error: { message: "Internal Workspace Disruption", code: 'SYSTEM_FAULT' } };
  }
}

// STANDARDIZED CRUD WITH OWNERSHIP CHECKS

async function checkOwnership(supabase: any, surveyId: string, userId: string) {
  const { data } = await supabase
    .from('surveys')
    .select('id')
    .eq('id', surveyId)
    .eq('creator_id', userId)
    .single();
  return !!data;
}

export async function saveSection(surveyId: string, section: Partial<SurveySection>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };
  if (!(await checkOwnership(supabase, surveyId, user.id))) return { error: "Access denied." };

  const { id, created_at, updated_at, questions, ...sectionData } = section as any;

  let result;
  if (id && !id.startsWith('temp-')) {
    result = await supabase
      .from('survey_sections')
      .update(sectionData)
      .eq('id', id)
      .eq('survey_id', surveyId)
      .select()
      .single();
  } else {
    result = await supabase
      .from('survey_sections')
      .insert({ ...sectionData, survey_id: surveyId })
      .select()
      .single();
  }

  if (result.error) return { error: result.error };
  revalidatePath(`/creator-surveys/${surveyId}/build`);
  return { data: result.data };
}

export async function deleteSection(surveyId: string, sectionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };
  if (!(await checkOwnership(supabase, surveyId, user.id))) return { error: "Access denied." };

  const { error } = await supabase
    .from('survey_sections')
    .delete()
    .eq('id', sectionId)
    .eq('survey_id', surveyId);

  if (!error) revalidatePath(`/creator-surveys/${surveyId}/build`);
  return { error };
}

export async function saveQuestion(surveyId: string, question: Partial<SurveyQuestion>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };
  if (!(await checkOwnership(supabase, surveyId, user.id))) return { error: "Access denied." };

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
  revalidatePath(`/creator-surveys/${surveyId}/build`);
  return { data: result.data };
}

export async function deleteQuestion(surveyId: string, questionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };
  if (!(await checkOwnership(supabase, surveyId, user.id))) return { error: "Access denied." };

  const { error } = await supabase
    .from('survey_questions')
    .delete()
    .eq('id', questionId)
    .eq('survey_id', surveyId);

  if (!error) revalidatePath(`/creator-surveys/${surveyId}/build`);
  return { error };
}

export async function saveOption(questionId: string, option: Partial<SurveyOption>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  // Get surveyId to check ownership
  const { data: question } = await supabase
    .from('survey_questions')
    .select('survey_id')
    .eq('id', questionId)
    .single();

  if (!question || !(await checkOwnership(supabase, question.survey_id, user.id))) {
    return { error: "Access denied." };
  }

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

  const { data: question } = await supabase
    .from('survey_questions')
    .select('survey_id')
    .eq('id', questionId)
    .single();

  if (!question || !(await checkOwnership(supabase, question.survey_id, user.id))) {
    return { error: "Access denied." };
  }

  const { error } = await supabase
    .from('survey_options')
    .delete()
    .eq('id', optionId)
    .eq('question_id', questionId);

  return { error };
}

export async function createLogicRule(surveyId: string, rule: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };
  if (!(await checkOwnership(supabase, surveyId, user.id))) return { error: "Access denied." };

  const { id, created_at, updated_at, ...ruleData } = rule;
  const result = await supabase
    .from('survey_logic_rules')
    .insert({ ...ruleData, survey_id: surveyId })
    .select()
    .single();

  if (!result.error) revalidatePath(`/creator-surveys/${surveyId}/build`);
  return { data: result.data, error: result.error };
}

export async function updateLogicRule(surveyId: string, ruleId: string, updates: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };
  if (!(await checkOwnership(supabase, surveyId, user.id))) return { error: "Access denied." };

  const { id, created_at, updated_at, ...ruleData } = updates;
  const result = await supabase
    .from('survey_logic_rules')
    .update(ruleData)
    .eq('id', ruleId)
    .eq('survey_id', surveyId)
    .select()
    .single();

  if (!result.error) revalidatePath(`/creator-surveys/${surveyId}/build`);
  return { data: result.data, error: result.error };
}

export async function saveLogicRule(surveyId: string, rule: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };
  if (!(await checkOwnership(supabase, surveyId, user.id))) return { error: "Access denied." };

  const { id, created_at, updated_at, ...ruleData } = rule;

  let result;
  if (id && !id.startsWith('temp-')) {
    result = await supabase
      .from('survey_logic_rules')
      .update(ruleData)
      .eq('id', id)
      .eq('survey_id', surveyId)
      .select()
      .single();
  } else {
    result = await supabase
      .from('survey_logic_rules')
      .insert({ ...ruleData, survey_id: surveyId })
      .select()
      .single();
  }

  if (!result.error) revalidatePath(`/creator-surveys/${surveyId}/build`);
  return { data: result.data, error: result.error };
}

export async function deleteLogicRule(surveyId: string, ruleId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };
  if (!(await checkOwnership(supabase, surveyId, user.id))) return { error: "Access denied." };

  return await supabase
    .from('survey_logic_rules')
    .delete()
    .eq('id', ruleId)
    .eq('survey_id', surveyId);
}

export async function reorderSections(surveyId: string, sectionIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };
  if (!(await checkOwnership(supabase, surveyId, user.id))) return { error: "Access denied." };

  const updates = sectionIds.map((id, index) =>
    supabase.from('survey_sections').update({ order_index: index }).eq('id', id).eq('survey_id', surveyId)
  );
  await Promise.all(updates);
  revalidatePath(`/creator-surveys/${surveyId}/build`);
  return { success: true };
}

export async function reorderQuestions(surveyId: string, questionIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };
  if (!(await checkOwnership(supabase, surveyId, user.id))) return { error: "Access denied." };

  const updates = questionIds.map((id, index) =>
    supabase.from('survey_questions').update({ order_index: index }).eq('id', id).eq('survey_id', surveyId)
  );
  await Promise.all(updates);
  revalidatePath(`/creator-surveys/${surveyId}/build`);
  return { success: true };
}

export async function updateSurveyDetails(surveyId: string, updates: Partial<Survey>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };
  if (!(await checkOwnership(supabase, surveyId, user.id))) return { error: "Access denied." };

  const { data, error } = await supabase
    .from('surveys')
    .update(updates)
    .eq('id', surveyId)
    .select()
    .single();

  if (!error) revalidatePath(`/creator-surveys/${surveyId}/build`);
  return { data, error };
}

export async function getCreatorSurveys(page: number = 1, pageSize: number = 10) {
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

  const formattedData = data.map(s => ({
    ...s,
    response_count: (s as any).response_count?.[0]?.count || 0
  }));

  return JSON.parse(JSON.stringify({ data: formattedData, count: count || 0 }, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export async function getSurveyStats() {
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
  if (!(await checkOwnership(supabase, surveyId, user.id))) return { error: "Access denied." };

  const { data, error } = await supabase
    .from('surveys')
    .update({ status })
    .eq('id', surveyId)
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

  revalidatePath('/creator-surveys');
  revalidatePath(`/creator-surveys/${surveyId}/build`);
  return { data };
}

export async function duplicateSurvey(surveyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };
  if (!(await checkOwnership(supabase, surveyId, user.id))) return { error: "Access denied." };

  const { data: existingSurvey, error: fetchError } = await supabase
    .from('surveys')
    .select(`*, questions:survey_questions(*, options:survey_options(*)), sections:survey_sections(*)`)
    .eq('id', surveyId)
    .single();

  if (fetchError || !existingSurvey) return { error: "Survey not found." };

  const { id, created_at, updated_at, questions, sections, ...surveyData } = existingSurvey as any;

  const { data: newSurvey, error: insertError } = await supabase
    .from('surveys')
    .insert({
      ...surveyData,
      title: `${existingSurvey.title} (Copy)`,
      status: 'draft',
      legacy_questions: []
    })
    .select()
    .single();

  if (insertError) return { error: insertError };

  // Duplicate sections
  const sectionMap: Record<string, string> = {};
  for (const s of (sections || [])) {
    const { id: oldSid, created_at: sca, updated_at: sua, ...sData } = s;
    const { data: newS } = await supabase.from('survey_sections').insert({ ...sData, survey_id: newSurvey.id }).select().single();
    if (newS) sectionMap[oldSid] = newS.id;
  }

  // Duplicate questions
  for (const q of (questions || [])) {
    const { id: oldQid, created_at: qca, updated_at: qua, options, section_id, ...qData } = q;
    const { data: newQ } = await supabase.from('survey_questions').insert({
      ...qData,
      survey_id: newSurvey.id,
      section_id: section_id ? sectionMap[section_id] : null
    }).select().single();

    if (newQ && options) {
      for (const o of options) {
        const { id: oldOid, created_at: oca, updated_at: oua, ...oData } = o;
        await supabase.from('survey_options').insert({ ...oData, question_id: newQ.id });
      }
    }
  }

  revalidatePath('/creator-surveys');
  return { data: newSurvey };
}

export async function deleteSurvey(surveyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };
  if (!(await checkOwnership(supabase, surveyId, user.id))) return { error: "Access denied." };

  const { error } = await supabase.from('surveys').delete().eq('id', surveyId);
  if (!error) revalidatePath('/creator-surveys');
  return { success: !error, error };
}

export async function submitSurveyResponse(surveyId: string, answers: Record<string, any>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: survey } = await supabase.from('surveys').select('settings').eq('id', surveyId).single();
  if (survey?.settings?.anonymous === false && !user) return { error: "Authentication required." };

  return await supabase
    .from('survey_responses')
    .insert({
      survey_id: surveyId,
      participant_id: user?.id || null,
      responses: answers
    })
    .select()
    .single();
}
