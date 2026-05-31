"use client";
export const dynamic = "force-dynamic";



import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LayoutGrid, Loader2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      const supabase = createClient();
      const { data } = await supabase
        .from('projects')
        .select(`
          *,
          creator:profiles(full_name)
        `)
        .order('created_at', { ascending: false });

      if (data) setProjects(data);
      setLoading(false);
    }
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="text-nova-cyan animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 pt-24">
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Projects</h1>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Active innovation initiatives</p>
      </header>

      {projects.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border-white/5">
          <p className="text-white/20 uppercase tracking-widest text-sm">No active projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl overflow-hidden border-white/5 group hover:border-nova-cyan/30 transition-all"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={project.thumbnail_url || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt={project.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
              <div className="p-6">
                <div className="text-[10px] text-nova-cyan font-bold uppercase tracking-widest mb-2">
                  {project.creator?.full_name}
                </div>
                <h3 className="text-xl font-bold mb-3">{project.title}</h3>
                <p className="text-sm text-white/40 line-clamp-2 mb-6">{project.description}</p>
                <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  Access Repository <ExternalLink size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
