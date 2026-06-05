import React from 'react';
import { getSurveyForEdit } from '@/lib/actions/surveys/architect';
import SurveyArchitect from '@/components/survey/SurveyArchitect';
import { notFound } from 'next/navigation';

export default async function EditSurveyPage({ params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const surveyData = await getSurveyForEdit(id);
    return (
      <div className="pt-24">
        <SurveyArchitect initialData={surveyData} />
      </div>
    );
  } catch (error) {
    notFound();
  }
}
