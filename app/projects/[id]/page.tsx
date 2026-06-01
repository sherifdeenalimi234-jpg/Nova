"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getProject,
  deleteProject,
  archiveProject,
  updateProject
} from '@/lib/actions/projects';
import {
  Loader2,
  Calendar,
  Globe,
  Lock,
  Trash2,
  Archive,
  Edit3,
  Briefcase,
  X,
  Check,
  Clock
} from 'lucide-react';
import ProjectTopBar from '@/components/projects/ProjectTopBar';
import { createClient } from '@/lib/supabase/client';

export default function ProjectDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      const { data, error } = await getProject(id);
      if (data) {
        setProject(data);
      }
      setLoading(false);
    }
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="text-nova-cyan animate-spin" size={32} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
        <Briefcase size={64} className="text-white/10 mb-6" />
        <h2 className="text-xl font-black uppercase tracking-widest mb-2">Project Not Found</h2>
        <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mb-8">The innovation node you are looking for does not exist or has been decommissioned.</p>
        <button onClick={() => router.push('/projects')} className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest">
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      <ProjectTopBar title="Innovation Node" />

      {/* Hero Section */}
      <div className="relative h-72 w-full pt-16">
        {project.cover_image ? (
          <img src={project.cover_image} className="w-full h-full object-cover" alt={project.title} />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <Briefcase size={48} className="text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex gap-2 mb-3">
             <span className="px-3 py-1 rounded-full bg-nova-cyan/20 border border-nova-cyan/30 text-[8px] font-black uppercase tracking-widest text-nova-cyan">
                {project.project_type}
             </span>
             <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/60">
                {project.status}
             </span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight">{project.title}</h1>
        </div>
      </div>

      <main className="px-6 space-y-10 mt-6">
        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-4">
           <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1 flex items-center gap-2">
                 <Globe size={10} /> Visibility
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-nova-cyan">{project.visibility}</p>
           </div>
           <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1 flex items-center gap-2">
                 <Calendar size={10} /> Created
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
                 {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
           </div>
           <div className="p-4 rounded-3xl bg-white/5 border border-white/5 col-span-2">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1 flex items-center gap-2">
                 <Clock size={10} /> Last Updated
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
                 {new Date(project.updated_at).toLocaleString()}
              </p>
           </div>
        </div>

        {/* Description Section */}
        <section className="space-y-4">
           <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Specifications</h2>
              <span className="px-2 py-1 rounded bg-nova-cyan/10 text-nova-cyan text-[7px] font-black uppercase tracking-widest">{project.category}</span>
           </div>

           <p className="text-[11px] leading-relaxed text-white/60 uppercase tracking-widest whitespace-pre-wrap">
              {project.short_description}
           </p>
        </section>

        {/* Community Engagement (Placeholder) */}
        <section className="pt-10 border-t border-white/5 space-y-6">
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Community Protocol</h2>
           <div className="flex gap-4">
              <button className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest">
                 Appreciate Node
              </button>
              <button className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest">
                 View Roadmap
              </button>
           </div>
        </section>
      </main>
    </div>
  );
}
