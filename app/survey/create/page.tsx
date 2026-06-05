import { createInitialSurvey } from '@/lib/actions/surveys/architect';
import { redirect } from 'next/navigation';

export default async function CreateSurveyRedirect() {
  const survey = await createInitialSurvey();
  redirect(`/survey/create/${survey.id}`);
}
