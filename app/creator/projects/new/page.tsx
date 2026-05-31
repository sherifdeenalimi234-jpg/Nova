"use client";
export const dynamic = "force-dynamic";



import React, { useState } from 'react';
import { createProject } from '@/lib/actions/projects';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  Cpu,
  Users,
  Zap,
  Layout
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreateProjectPage() {
  const router = useRouter();
  const [techStack, setTechStack] = useState<string[]>([]);
  const [newTech, setNewTech] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const addTech = () => {
    if (newTech && !techStack.includes(newTech)) {
      setTechStack([...techStack, newTech]);
      setNewTech('');
    }
  };

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter(t => t !== tech));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Initialize Project</h1>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Register a new innovation node in your portfolio</p>
         </div>
         <div className="flex gap-4">
            <button
              onClick={async () => {
                if (!title || !description) return;
                setLoading(true);
                const { error } = await createProject({
                  title,
                  description
                });
                setLoading(false);
                if (!error) router.push('/creator/projects');
              }}
              disabled={loading}
              className="px-8 py-3 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-nova-cyan transition-all disabled:opacity-50"
            >
               {loading ? 'Deploying...' : 'Deploy Project'}
            </button>
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          {/* Basic Info */}
          <section className="p-10 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-8">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Project Identity</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Project Title"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-8 py-5 text-lg font-bold focus:outline-none focus:border-nova-cyan/50 transition-all placeholder:text-white/10"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Innovation Abstract</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the core purpose and impact of this project..."
                  rows={6}
                  className="w-full bg-black/40 border border-white/5 rounded-[2rem] px-8 py-6 text-sm focus:outline-none focus:border-nova-cyan/50 transition-all placeholder:text-white/10 resize-none"
                />
             </div>
          </section>

          {/* Media Showcase */}
          <section className="p-10 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
             <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40">Visual Documentation</h2>
                <span className="text-[8px] font-black uppercase tracking-widest text-nova-cyan">Max 10 Logs</span>
             </div>
             <div className="grid grid-cols-2 gap-6">
                <label className="aspect-video rounded-3xl border border-dashed border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center gap-4 cursor-pointer group">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:text-nova-cyan transition-colors">
                      <ImageIcon size={24} />
                   </div>
                   <div className="text-center">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-1">Primary Display</p>
                      <p className="text-[7px] text-white/20 uppercase tracking-widest">High-res required</p>
                   </div>
                </label>
                <div className="grid grid-cols-2 gap-4">
                   {[1, 2, 3, 4].map((i) => (
                     <div key={i} className="aspect-square rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-center">
                        <Plus size={16} className="text-white/5" />
                     </div>
                   ))}
                </div>
             </div>
          </section>

          {/* Tech Stack */}
          <section className="p-10 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
             <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-8 px-2">Technology Framework</h2>
             <div className="flex flex-wrap gap-3 mb-8">
                {techStack.map((tech) => (
                  <div key={tech} className="px-5 py-2.5 rounded-xl bg-nova-cyan/5 border border-nova-cyan/20 flex items-center gap-3 group">
                     <span className="text-[10px] font-black uppercase tracking-widest text-nova-cyan">{tech}</span>
                     <button onClick={() => removeTech(tech)} className="text-white/20 hover:text-white transition-colors">
                        <Trash2 size={12} />
                     </button>
                  </div>
                ))}
             </div>
             <div className="flex gap-4">
                <input
                  type="text"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTech()}
                  placeholder="Add technology (e.g. Next.js, Rust, AI)..."
                  className="flex-1 bg-black/40 border border-white/5 rounded-xl px-6 py-4 text-xs focus:outline-none focus:border-nova-cyan/30"
                />
                <button
                  onClick={addTech}
                  className="px-6 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10"
                >
                   Add
                </button>
             </div>
          </section>
        </div>

        <div className="space-y-8">
           {/* Status & Links */}
           <section className="p-10 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-10">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-2">Project Status</label>
                 <div className="grid grid-cols-1 gap-2">
                    {['Active', 'Researching', 'Completed', 'Archived'].map((status) => (
                      <button key={status} className="w-full text-left px-6 py-4 rounded-2xl border border-white/5 bg-white/2 text-[9px] font-black uppercase tracking-widest hover:border-nova-cyan/30 transition-all">
                        {status}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-6 pt-10 border-t border-white/5">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Live Demo</label>
                    <div className="relative">
                       <ExternalLink size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
                       <input
                         type="text"
                         placeholder="https://..."
                         className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-xs focus:outline-none"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Repository</label>
                    <div className="relative">
                       <Layout size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
                       <input
                         type="text"
                         placeholder="https://github.com/..."
                         className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-xs focus:outline-none"
                       />
                    </div>
                 </div>
              </div>
           </section>

           <div className="p-10 rounded-[3rem] bg-gradient-to-br from-nova-purple/10 to-nova-cyan/10 border border-white/5">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Zap size={18} className="text-nova-purple" />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Ecosystem Impact</h4>
              </div>
              <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-widest">
                 High-quality projects gain featured status on the ecosystem landing page and increase your Node Authority.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
