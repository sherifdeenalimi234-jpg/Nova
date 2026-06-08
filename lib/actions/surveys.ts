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
      questions: [] // Ensure questions is initialized
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
  // Optional fields
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

  // 1. Validate Required Fields
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

  // 2. Create Survey Record (Survey Blueprint System V1)
  // We use a safe mapping to handle potentially missing columns gracefully
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
    questions: [] // Legacy column compatibility
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

    // If it's a column missing error, try a fallback to minimal record
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

       if (fallbackError) {
         console.error("[createSurveyWorkspace] Fallback Insert Failed:", fallbackError);
         return { success: false, error: fallbackError.message };
       }
       finalId = fallbackSurvey.id;
       warning = "Some blueprint fields could not be saved due to schema mismatch.";
    } else {
      return { success: false, error: error.message };
    }
  }

  if (!finalId) {
    return { success: false, error: "Failed to establish research node ID." };
  }

  console.log("[createSurveyWorkspace] Successfully established survey node:", finalId);

  // 3. Activity Feed (Audit Requirement)
  try {
    await supabase.from('activity_feed').insert({
      user_id: user.id,
      action: 'INITIALIZED BLUEPRINT WORKSPACE',
      entity_id: finalId,
      entity_type: 'survey'
    });
  } catch (feedErr) {
    console.error("[createSurveyWorkspace] Activity feed log failed (non-blocking):", feedErr);
  }

  // 4. Force Revalidation
  revalidatePath('/creator-surveys');
  revalidatePath(`/creator-surveys/${finalId}`);

  return { success: true, id: finalId, warning };
}

export async function getSurveyForBuilder(surveyId: string): Promise<{ data?: Survey, error?: any }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: { message: "Authentication required.", code: 'AUTH_REQUIRED' } };

    // 1. Primary Fetch Attempt (Full Schema)
    let { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .eq('creator_id', user.id)
      .single();

    // 2. Schema Fallback (If columns missing)
    if (surveyError) {
      const isSchemaError = surveyError.code === '42703' || surveyError.message?.includes('column');
      if (isSchemaError) {
        console.warn("[getSurveyForBuilder] Schema mismatch detected, falling back to core fields...");
        const fallback = await supabase
          .from('surveys')
          .select('id, creator_id, title, status, created_at, updated_at')
          .eq('id', surveyId)
          .eq('creator_id', user.id)
          .single();

        if (fallback.error) return { error: fallback.error };
        survey = {
          ...fallback.data,
          research_objective: "Schema Sync Required.",
          visibility: 'Private',
          survey_mode: 'Standard',
          target_audience: 'N/A',
          target_responses: '0',
          tags: []
        };
      } else {
        return { error: surveyError };
      }
    }

    if (!survey) return { error: { message: "Node not found in intelligence stream.", code: 'NOT_FOUND' } };

    // 3. Section & Question Fetch
    let sectionsData: any[] = [];
    let questionsData: any[] = [];
    try {
      // Fetch Sections
      const { data: sData, error: sError } = await supabase
        .from('survey_sections')
        .select('*')
        .eq('survey_id', surveyId)
        .order('order_index', { ascending: true });

      if (!sError && sData) {
        sectionsData = sData;
      }

      // Fetch Questions
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
    } catch (innerErr) {
      console.warn("[getSurveyForBuilder] Data retrieval failed (non-blocking):", innerErr);
    }

    // 4. Final Assembler (Absolute Serializability)
    const result = {
      ...survey,
      sections: sectionsData,
      questions: questionsData,
      tags: survey.tags || [],
      settings: survey.settings || { anonymous: false, one_response_per_participant: true },
      category: survey.category || 'General',
      status: survey.status || 'draft'
    };

    // Return a clean POJO with BigInt support
    return JSON.parse(JSON.stringify({ data: result as Survey }, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  } catch (err: any) {
    console.error("[getSurveyForBuilder] Critical System Fault:", err);
    return { error: { message: "Internal Workspace Disruption", code: 'SYSTEM_FAULT' } };
  }
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

  revalidatePath(`/creator-surveys/${surveyId}/build`);
  return { data };
}

// SECTION ACTIONS
export async function saveSection(surveyId: string, section: Partial<SurveySection>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

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

  const { error } = await supabase
    .from('survey_sections')
    .delete()
    .eq('id', sectionId)
    .eq('survey_id', surveyId);

  if (!error) {
    revalidatePath(`/creator-surveys/${surveyId}/build`);
  }
  return { error };
}

export async function reorderSections(surveyId: string, sectionIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const updates = sectionIds.map((id, index) =>
    supabase.from('survey_sections').update({ order_index: index }).eq('id', id).eq('survey_id', surveyId)
  );

  const results = await Promise.all(updates);
  const error = results.find(r => r.error)?.error;

  if (!error) {
    revalidatePath(`/creator-surveys/${surveyId}/build`);
  }
  return { error };
}

// QUESTION ACTIONS
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
  revalidatePath(`/creator-surveys/${surveyId}/build`);
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

  if (!error) {
    revalidatePath(`/creator-surveys/${surveyId}/build`);
  }
  return { error };
}

export async function reorderQuestions(surveyId: string, questionIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const updates = questionIds.map((id, index) =>
    supabase.from('survey_questions').update({ order_index: index }).eq('id', id).eq('survey_id', surveyId)
  );

  const results = await Promise.all(updates);
  const error = results.find(r => r.error)?.error;

  if (!error) {
    revalidatePath(`/creator-surveys/${surveyId}/build`);
  }
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

  return JSON.parse(JSON.stringify({ data: formattedData as Survey[], count: count || 0 }, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
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

  return JSON.parse(JSON.stringify({ data: stats }, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
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

  revalidatePath('/creator-surveys');
  revalidatePath('/creator');
  revalidatePath(`/creator-surveys/${surveyId}/build`);
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
      status: 'draft',
      questions: []
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

  revalidatePath('/creator-surveys');
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

  revalidatePath('/creator-surveys');
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
