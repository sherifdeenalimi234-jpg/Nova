import React from 'react';
import { getSurveyForBuilder } from '@/lib/actions/surveys';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import WorkspaceShell from './WorkspaceShell';

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

  const { data: survey, error } = await getSurveyForBuilder(id);

  if (error || !survey) {
    notFound();
  }

  if (survey.creator_id !== user.id) {
    redirect('/creator-surveys');
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black">
        <WorkspaceShell survey={survey}>
            {children}
        </WorkspaceShell>
    </div>
  );
}
