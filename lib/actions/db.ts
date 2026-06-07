"use server";

import { createClient } from '@/lib/supabase/server';
import { ADMIN_EMAIL } from '@/lib/constants';

/**
 * Proactively ensures the surveys table has the required blueprint columns.
 * This is a "self-healing" utility designed for Phase 1B/2 transition.
 */
export async function ensureSurveySchema() {
  const supabase = await createClient();

  // 1. Check if user is admin (security requirement for DDL)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Auth required" };

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.is_admin || user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (!isAdmin) {
    return { success: false, error: "Admin privilege required for schema repair." };
  }

  // 2. Define required columns and types
  const blueprintColumns = [
    { name: 'research_objective', type: 'TEXT' },
    { name: 'project_id', type: 'UUID REFERENCES projects(id)' },
    { name: 'survey_mode', type: 'TEXT' },
    { name: 'target_audience', type: 'TEXT' },
    { name: 'target_responses', type: 'INTEGER' },
    { name: 'visibility', type: "TEXT DEFAULT 'Private'" },
    { name: 'estimated_duration', type: 'TEXT' },
    { name: 'research_category', type: 'TEXT' },
    { name: 'language', type: "TEXT DEFAULT 'English'" },
    { name: 'research_timeline', type: 'TEXT' },
    { name: 'research_notes', type: 'TEXT' },
    { name: 'questions', type: "JSONB DEFAULT '[]'::jsonb" }
  ];

  console.log("[SchemaUtility] Starting survey table audit...");

  let successCount = 0;
  let errors: string[] = [];

  for (const col of blueprintColumns) {
    const sql = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='${col.name}') THEN
          ALTER TABLE surveys ADD COLUMN ${col.name} ${col.type};
        END IF;
      END $$;
    `;

    // Attempt execution via exec_sql_admin RPC if it exists
    const { error } = await supabase.rpc('exec_sql_admin', { sql_query: sql });

    if (error) {
      errors.push(`${col.name}: ${error.message}`);
    } else {
      successCount++;
    }
  }

  // Notify PostgREST to reload schema cache
  try {
    await supabase.rpc('exec_sql_admin', { sql_query: "NOTIFY pgrst, 'reload schema';" });
  } catch (notifyErr) {
    console.warn("[SchemaUtility] PostgREST reload notification failed:", notifyErr);
  }

  return {
    success: errors.length === 0,
    repaired: successCount,
    errors: errors.length > 0 ? errors : null
  };
}
