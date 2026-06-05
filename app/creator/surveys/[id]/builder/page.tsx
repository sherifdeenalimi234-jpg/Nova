import { getSurveyForBuilder } from '@/lib/actions/surveys';
import BuilderClient from './BuilderClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: survey, error } = await getSurveyForBuilder(id);

  if (error || !survey) {
    notFound();
  }

  return <BuilderClient initialSurvey={survey} />;
}
