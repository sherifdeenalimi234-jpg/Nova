import React from 'react';
import { getCreatorSurveys } from '@/lib/actions/surveys/creator-actions';
import SurveyManagementView from '@/components/survey/SurveyManagementView';

export default async function SurveyManagementPage() {
  const initialSurveys = await getCreatorSurveys();

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24">
      <SurveyManagementView initialSurveys={initialSurveys} />
    </div>
  );
}
