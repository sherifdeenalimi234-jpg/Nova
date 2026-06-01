"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Briefcase, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { getCreatorProjects } from '@/lib/actions/projects';
import ProjectTopBar from '@/components/projects/ProjectTopBar';
import ProjectCard from '@/components/projects/ProjectCard';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = ['Active', 'Showcase', 'Archived'];

export default function ProjectsHub() {
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

  const filteredProjects = projects.filter(p => {
    if (activeTab === 'Archived') return p.status === 'Archived';
    if (activeTab === 'Showcase') return p.project_type === 'Showcase Project' && p.status !== 'Archived';
    if (activeTab === 'Active') return p.status === 'Active' && p.project_type === 'Live Project';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      <ProjectTopBar title="Projects Hub" showBack={false} />

      <main className="pt-24 px-4 space-y-8">
        {/* Welcome & Stats */}
        <section>
          <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Command Center</h2>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Manage your innovation ecosystem</p>
        </section>

        {/* Quick Actions */}
        <section>
          <Link
            href="/creator/projects/create"
            className="w-full py-5 rounded-[2rem] bg-white text-black flex items-center justify-center gap-3 hover:bg-nova-cyan transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-[0.98]"
          >
            <Plus size={20} strokeWidth={3} />
            <span className="text-xs font-black uppercase tracking-widest">Create Project</span>
          </Link>
        </section>

        {/* Tabs */}
        <section className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${
                activeTab === tab
                ? 'bg-nova-cyan text-black'
                : 'bg-white/5 text-white/40 border border-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </section>

        {/* Project List */}
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
                <Briefcase size={32} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-widest mb-2">No {activeTab} Nodes</h3>
                <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">Create a new innovation node to begin production</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
