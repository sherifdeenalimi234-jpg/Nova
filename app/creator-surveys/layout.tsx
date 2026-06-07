import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SurveyErrorBoundary } from '@/components/surveys/SurveyErrorBoundary';

export default async function CreatorSurveysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SurveyErrorBoundary>
        {children}
      </SurveyErrorBoundary>
    </div>
  );
}
