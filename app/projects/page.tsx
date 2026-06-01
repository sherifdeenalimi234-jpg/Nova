"use client";

import React, { useEffect, useState } from 'react';
import { Briefcase, Loader2, Search, Compass, Zap, Filter } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ProjectTopBar from '@/components/projects/ProjectTopBar';
import ProjectCard from '@/components/projects/ProjectCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicProjectsExplore() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPublicProjects = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members (count)
        `)
        .eq('visibility', 'Public')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProjects(data);
      }
      setLoading(false);
    };
    fetchPublicProjects();
  }, []);

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      <ProjectTopBar title="Discovery" showBack={false} />

      <main className="pt-24 px-4 space-y-8">
        {/* Hero */}
        <section className="relative h-48 rounded-[3rem] overflow-hidden bg-white/5 border border-white/5 p-8 flex flex-col justify-center">
           <div className="absolute inset-0 bg-gradient-to-br from-nova-cyan/10 to-transparent pointer-events-none" />
           <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Project Explorer</h2>
           <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Discover the next generation of innovation</p>
        </section>

        {/* Search & Filters */}
        <div className="flex gap-4">
           <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:border-nova-cyan outline-none transition-all"
              />
           </div>
           <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-nova-cyan transition-all">
              <Filter size={20} />
           </button>
        </div>

        {/* Categories (Mock for now) */}
        <section className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
           {['All Nodes', 'Blockchain', 'AI', 'Hardware', 'Software', 'Research'].map((cat, i) => (
             <button
               key={cat}
               className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${
                 i === 0
                 ? 'bg-nova-cyan text-black'
                 : 'bg-white/5 text-white/40 border border-white/5'
               }`}
             >
               {cat}
             </button>
           ))}
        </section>

        {/* Project Grid */}
        <section className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="text-nova-cyan animate-spin" size={32} />
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="py-20 rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white/20">
                <Compass size={32} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-widest mb-2">No Nodes Found</h3>
                <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">Adjust your filters or search parameters</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
