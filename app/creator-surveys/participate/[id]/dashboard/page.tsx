import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings, Share2, Plus } from 'lucide-react';

interface DashboardProps {
  params: Promise<{ id: string }>;
}

export default async function SurveyDashboard({ params }: DashboardProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: survey } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', id)
    .single();

  if (!survey) notFound();

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-3">
               <div className="px-2 py-0.5 rounded bg-nova-purple/20 text-nova-purple text-[8px] font-black uppercase tracking-widest border border-nova-purple/30">Active Workspace</div>
               <span className="text-[10px] text-white/20 font-mono tracking-widest">{id}</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight text-white">{survey.title}</h1>
          </div>
          <div className="flex gap-3">
             <button className="px-6 py-3 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-nova-cyan transition-all flex items-center gap-2">
                <Share2 size={14} /> Share Intelligence
             </button>
             <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all">
                <Settings size={18} />
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           {/* Sidebar */}
           <aside className="space-y-2">
              {[
                { label: 'Dashboard', icon: LayoutDashboard, active: true },
                { label: 'Questions', icon: FileText },
                { label: 'Participants', icon: Users },
                { label: 'Settings', icon: Settings },
              ].map((item) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                    item.active ? 'bg-nova-purple text-white shadow-[0_10px_30px_rgba(188,19,254,0.2)]' : 'text-white/40 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
           </aside>

           {/* Main Content */}
           <main className="md:col-span-3 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-8 rounded-[32px] bg-white/5 border border-white/10">
                    <div className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-4">Total Responses</div>
                    <div className="text-4xl font-black text-nova-cyan">0 / {survey.target_responses || 100}</div>
                    <div className="mt-4 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-nova-cyan w-[2%]" />
                    </div>
                 </div>
                 <div className="p-8 rounded-[32px] bg-white/5 border border-white/10">
                    <div className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-4">Survey Status</div>
                    <div className="text-4xl font-black text-nova-green uppercase">Ready</div>
                    <p className="mt-2 text-[10px] text-white/20 uppercase tracking-widest font-bold">Waiting for deployment</p>
                 </div>
              </div>

              <div className="p-12 rounded-[48px] border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 rounded-full bg-nova-purple/10 flex items-center justify-center mb-8">
                    <Plus size={32} className="text-nova-purple" />
                 </div>
                 <h2 className="text-xl font-bold uppercase tracking-widest mb-4 text-white">Initialize Survey Questions</h2>
                 <p className="text-white/40 text-sm max-w-xs leading-relaxed mb-10">Your blueprint is ready. Begin building your research survey questions.</p>
                 <button className="px-10 py-4 rounded-2xl bg-nova-purple text-white text-[10px] font-black uppercase tracking-[0.3em] hover:shadow-[0_10px_40px_rgba(188,19,254,0.3)] transition-all">
                    Build Questions
                 </button>
              </div>
           </main>
        </div>
      </div>
    </div>
  );
}
