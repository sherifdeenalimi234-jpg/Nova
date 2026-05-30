"use client";

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Briefcase,
  ExternalLink,
  MoreVertical,
  Search,
  LayoutGrid,
  List as ListIcon,
  Calendar,
  Users,
  Clock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { getCreatorProjects } from '@/lib/actions/projects';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = ['Active', 'Draft', 'Completed', 'Archived'];

export default function ProjectsManagementPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Active');

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await getCreatorProjects();
      if (!error && data) {
        setProjects(data);
      }
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => p.status === activeTab);

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
        <div>
           <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Innovation Directory</h1>
           <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Manage your active innovation nodes</p>
        </div>
        <Link href="/creator/projects/new" className="px-6 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-nova-cyan transition-all flex items-center justify-center gap-2 group">
           <Plus size={14} className="group-hover:rotate-90 transition-transform" />
           Initialize Node
        </Link>
      </header>

      {/* Mobile Tabs */}
      <div className="flex overflow-x-auto pb-4 px-4 md:px-0 no-scrollbar -mx-4 md:mx-0">
         <div className="flex gap-2 min-w-full">
            {TABS.map((tab) => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${
                     activeTab === tab
                     ? 'bg-nova-cyan text-black'
                     : 'bg-white/5 text-white/40 border border-white/5 hover:border-white/10'
                  }`}
               >
                  {tab}
               </button>
            ))}
         </div>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
            {[1, 2, 3].map(i => (
               <div key={i} className="h-80 rounded-[2.5rem] md:rounded-[3rem] bg-white/5 animate-pulse border border-white/5" />
            ))}
         </div>
      ) : filteredProjects.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
            <AnimatePresence mode="popLayout">
               {filteredProjects.map((project) => (
                  <motion.div
                     layout
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     key={project.id}
                     className="p-1 rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-br from-white/10 to-transparent border border-white/5 group hover:border-nova-cyan/30 transition-all overflow-hidden"
                  >
                     <Link href={`/creator/projects/${project.id}`} className="block h-full bg-[#0a0a0a] rounded-[2.4rem] md:rounded-[2.9rem] p-6 md:p-8 flex flex-col justify-between">
                        <div>
                           <div className="flex items-center justify-between mb-6">
                              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-nova-cyan/30 transition-all overflow-hidden">
                                 {project.cover_image ? (
                                    <img src={project.cover_image} alt={project.title} className="w-full h-full object-cover" />
                                 ) : (
                                    <Briefcase size={20} className="text-white/20 group-hover:text-nova-cyan transition-colors" />
                                 )}
                              </div>
                              <div className="flex gap-2">
                                 <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                                    <span className="text-[7px] font-black uppercase tracking-widest text-white/40">{project.category}</span>
                                 </div>
                                 <button className="p-2 text-white/20 hover:text-white">
                                    <MoreVertical size={16} />
                                 </button>
                              </div>
                           </div>

                           <h3 className="text-xl font-black mb-3 group-hover:text-nova-cyan transition-colors line-clamp-1">{project.title}</h3>
                           <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed line-clamp-2 mb-6">
                              {project.short_description}
                           </p>

                           <div className="flex flex-wrap gap-2 mb-8">
                              {project.tags?.slice(0, 3).map((t: string) => (
                                 <span key={t} className="text-[7px] font-black uppercase tracking-[0.2em] text-white/20 bg-white/5 px-2 py-1 rounded-md">{t}</span>
                              ))}
                              {project.tags?.length > 3 && <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/10">+{project.tags.length - 3} More</span>}
                           </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                           <div className="flex gap-6">
                              <div>
                                 <p className="text-[7px] font-black uppercase tracking-widest text-white/20 mb-1 flex items-center gap-1">
                                    <Users size={8} /> Team
                                 </p>
                                 <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                                    {project.project_members?.[0]?.count || 1} Nodes
                                 </span>
                              </div>
                              <div>
                                 <p className="text-[7px] font-black uppercase tracking-widest text-white/20 mb-1 flex items-center gap-1">
                                    <Clock size={8} /> Updated
                                 </p>
                                 <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                                    {new Date(project.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                 </span>
                              </div>
                           </div>
                           <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-nova-cyan group-hover:border-nova-cyan transition-all">
                              <ArrowRight size={16} className="text-white/20 group-hover:text-black transition-colors" />
                           </div>
                        </div>
                     </Link>
                  </motion.div>
               ))}
            </AnimatePresence>

            <Link href="/creator/projects/new" className="p-8 rounded-[2.5rem] md:rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center gap-4 group cursor-pointer min-h-[20rem]">
               <div className="w-14 h-14 rounded-full border border-white/5 flex items-center justify-center group-hover:text-nova-cyan group-hover:border-nova-cyan/50 transition-all bg-white/2">
                  <Plus size={24} />
               </div>
               <div className="text-center">
                  <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Initialize Node</span>
                  <span className="block text-[8px] font-black uppercase tracking-widest text-white/10">Add new project to directory</span>
               </div>
            </Link>
         </div>
      ) : (
         <div className="px-4 md:px-0">
            <div className="py-20 rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-6">
               <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white/20">
                  <Briefcase size={32} />
               </div>
               <div>
                  <h3 className="text-lg font-black uppercase tracking-widest mb-2">No {activeTab} Nodes</h3>
                  <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">Initialize a new innovation node to begin production</p>
               </div>
               <Link href="/creator/projects/new" className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                  Initialize Project
               </Link>
            </div>
         </div>
      )}
    </div>
  );
}
