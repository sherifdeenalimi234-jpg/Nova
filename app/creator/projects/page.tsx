"use client";

import React from 'react';
import {
  Plus,
  Briefcase,
  ExternalLink,
  MoreVertical,
  Search,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import Link from 'next/link';

export default function ProjectsManagementPage() {
  const projects = [
    { id: '1', title: 'Nexus Protocol Alpha', status: 'Active', tech: ['Next.js', 'Rust'], impact: 'High' },
    { id: '2', title: 'Neural Grid Visualization', status: 'Researching', tech: ['Three.js', 'AI'], impact: 'Medium' },
    { id: '3', title: 'Ecosystem Identity Framework', status: 'Completed', tech: ['Supabase', 'EVM'], impact: 'High' },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Projects</h1>
           <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Initialize and deploy innovation nodes</p>
        </div>
        <Link href="/creator/projects/new" className="px-6 py-3 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-nova-cyan transition-all flex items-center gap-2">
           <Plus size={14} />
           Initialize Node
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {projects.map((project) => (
           <div key={project.id} className="p-8 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl group hover:border-white/10 transition-all flex flex-col justify-between h-80">
              <div>
                 <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-nova-cyan/30 transition-all">
                       <Briefcase size={18} className="text-white/40 group-hover:text-nova-cyan transition-colors" />
                    </div>
                    <button className="p-2 text-white/20 hover:text-white">
                       <MoreVertical size={16} />
                    </button>
                 </div>
                 <h3 className="text-lg font-black mb-4 group-hover:text-nova-cyan transition-colors">{project.title}</h3>
                 <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech.map(t => (
                      <span key={t} className="text-[8px] font-black uppercase tracking-widest text-white/20">{t}</span>
                    ))}
                 </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                 <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Status</p>
                    <span className="text-[9px] font-black uppercase tracking-widest text-nova-cyan">{project.status}</span>
                 </div>
                 <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Impact</p>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/60">{project.impact}</span>
                 </div>
              </div>
           </div>
         ))}

         <Link href="/creator/projects/new" className="p-8 rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center gap-4 group cursor-pointer h-80">
            <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:text-nova-cyan transition-colors">
               <Plus size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Add Innovation Node</span>
         </Link>
      </div>
    </div>
  );
}
