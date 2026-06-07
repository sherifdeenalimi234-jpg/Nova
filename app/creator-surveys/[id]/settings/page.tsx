import { getSurveyForBuilder } from '@/lib/actions/surveys';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SettingsModule from './SettingsModule';

export const dynamic = 'force-dynamic';

export default async function SurveySettingsPage({ params }: { params: Promise<{ id: string }> }) {
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

  return <SettingsModule survey={survey} />;
}
