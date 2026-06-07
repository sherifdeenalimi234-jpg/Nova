import React from 'react';
import { getSurveyForBuilder } from '@/lib/actions/surveys';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import WorkspaceShell from './WorkspaceShell';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

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
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mb-8 border border-red-500/20">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Workspace Sync Error</h2>
        <p className="text-white/40 text-xs uppercase tracking-widest max-w-xs mb-10 leading-relaxed">
          The requested research node could not be retrieved from the intelligence stream. It may have been decommissioned or access was revoked.
        </p>
        <Link
          href="/creator-surveys"
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          <ChevronLeft size={16} />
          Return to Hub
        </Link>
      </div>
    );
  }

  if (survey.creator_id !== user.id) {
    console.log("[WorkspaceLayout] Access denied: User is not the creator");
    redirect('/creator-surveys');
  }

  return (
    <WorkspaceShell survey={survey}>
      {children}
    </WorkspaceShell>
  );
}
