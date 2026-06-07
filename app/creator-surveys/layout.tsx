import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Bell,
  PlusCircle,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import SurveyNav from '@/components/surveys/SurveyNav';
import { SurveyErrorBoundary } from '@/components/surveys/SurveyErrorBoundary';

export default async function SurveyPlatformLayout({
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
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar Navigation */}
      <SurveyNav />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 min-h-screen pt-16 lg:pt-0 pb-20 lg:pb-0">
        {/* Universal Survey Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-xl sticky top-0 z-40 hidden lg:flex">
           <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Survey Intelligence Ecosystem</h2>
           </div>

           <div className="flex items-center gap-6">
              <button className="relative p-2 text-white/40 hover:text-white transition-colors">
                 <Bell size={20} />
                 <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-nova-purple" />
              </button>
              <Link href="/creator-surveys/blueprint" className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                 <div className="w-6 h-6 rounded-lg bg-nova-purple/20 flex items-center justify-center">
                    <PlusCircle size={14} className="text-nova-purple" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest">New Research</span>
              </Link>
           </div>
        </header>

        <div className="p-8">
           <SurveyErrorBoundary>
              {children}
           </SurveyErrorBoundary>
        </div>
      </main>

      {/* Mobile Nav would go here, can create SurveyMobileNav if needed */}
    </div>
  );
}
