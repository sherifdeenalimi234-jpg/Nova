import React from 'react';
import { getSurveyForBuilder } from '@/lib/actions/surveys';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import WorkspaceShell from './WorkspaceShell';
import WorkspaceErrorState from '@/components/surveys/WorkspaceErrorState';

export const dynamic = 'force-dynamic';

export default async function WorkspaceLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  let survey = null;
  let fetchError = null;

  try {
    const result = await getSurveyForBuilder(id);
    survey = result.data;
    fetchError = result.error;
  } catch (err) {
    console.error("[WorkspaceLayout] Critical fetch exception:", err);
    fetchError = err;
  }

  if (fetchError || !survey) {
    const isSchemaError = (fetchError as any)?.code === '42703' || (fetchError as any)?.message?.includes('column');
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <WorkspaceErrorState
          isSchemaError={isSchemaError}
          message={!survey && !fetchError ? "The survey node could not be found." : undefined}
        />
      </div>
    );
  }

  if (survey.creator_id !== user.id) {
    console.log("[WorkspaceLayout] Access denied: User is not the creator");
    redirect('/creator-surveys');
  }

  return (
    <WorkspaceShell survey={survey}>
      {children}
    </WorkspaceShell>
  );
}
