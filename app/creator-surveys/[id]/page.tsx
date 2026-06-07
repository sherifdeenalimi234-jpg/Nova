import { getSurveyForBuilder } from '@/lib/actions/surveys';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import OverviewContent from './OverviewContent';

export const dynamic = 'force-dynamic';

export default async function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: survey, error } = await getSurveyForBuilder(id);

  if (error || !survey) {
    console.error(`[WorkspacePage] Survey not found or error: ${id}`, error);
    notFound();
  }

  // Double check ownership
  if (survey.creator_id !== user.id) {
    redirect('/creator-surveys');
  }

  return <OverviewContent survey={survey} />;
}
