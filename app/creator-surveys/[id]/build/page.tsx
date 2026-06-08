import { getSurveyForBuilder } from '@/lib/actions/surveys';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BuildWorkspace from '@/components/surveys/builder/BuildWorkspace';
import WorkspaceErrorState from '@/components/surveys/WorkspaceErrorState';

export const dynamic = 'force-dynamic';

export default async function BuildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: survey, error } = await getSurveyForBuilder(id);

  if (error || !survey) {
    console.error(`[BuildPage] Survey not found or error: ${id}`, error);
    return (
      <WorkspaceErrorState
        title="Node Not Synchronized"
        message="The survey node exists but the data stream is still initializing. Please refresh."
        showHomeButton={false}
      />
    );
  }

  // Double check ownership
  if (survey.creator_id !== user.id) {
    redirect('/creator-surveys');
  }

  return <BuildWorkspace survey={survey} />;
}
