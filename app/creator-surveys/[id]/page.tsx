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
    // If we're here, it means layout.tsx didn't catch the error or we're in a race condition
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-xl font-bold mb-4">Node Not Synchronized</h2>
        <p className="text-white/40 mb-8">The survey node exists but the data stream is still initializing. Please refresh.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-nova-purple rounded-xl">Refresh Node</button>
      </div>
    );
  }

  // Double check ownership
  if (survey.creator_id !== user.id) {
    redirect('/creator-surveys');
  }

  return <OverviewContent survey={survey} />;
}
