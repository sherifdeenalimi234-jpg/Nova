"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProject } from '@/lib/actions/projects';
import {
  Loader2,
  Users,
  Briefcase,
  Globe,
  Lock,
  ArrowRight,
  FileText,
  Activity,
  RefreshCw,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
  Github,
  Link as LinkIcon
} from 'lucide-react';
import ProjectTopBar from '@/components/projects/ProjectTopBar';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export const dynamic = "force-dynamic";

const XIcon = ({ size = 24, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function ProjectWebsiteHomePage() {
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

  const stats = [
    { label: 'Members', value: project.project_members?.length ?? (typeof project.project_members === 'object' ? project.project_members.count : 1), icon: Users },
    { label: 'Files', value: project.stats?.files || 0, icon: FileText },
    { label: 'Activities', value: project.stats?.activities || 0, icon: Activity },
    { label: 'Updates', value: project.stats?.updates || 0, icon: RefreshCw },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <ProjectTopBar title="Innovation Node" />

      {/* Hero Section */}
      <section className="relative h-[65vh] w-full pt-16 flex flex-col justify-end overflow-hidden">
        {project.cover_image ? (
          <img src={project.cover_image} className="absolute inset-0 w-full h-full object-cover" alt={project.title} />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-[#080808] flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-nova-cyan/10 via-transparent to-nova-purple/10 opacity-50" />
             <div className="absolute w-[500px] h-[500px] bg-nova-cyan/5 blur-[120px] rounded-full -top-48 -left-48" />
             <div className="absolute w-[500px] h-[500px] bg-nova-purple/5 blur-[120px] rounded-full -bottom-48 -right-48" />
             <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl">
                  <Briefcase size={40} className="text-white/20" />
                </div>
                <div className="text-center">
                   <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-2">NOVA INNOVATION NODE</p>
                   <div className="flex gap-1 justify-center">
                      {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/5" />)}
                   </div>
                </div>
             </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />

        <div className="relative px-6 pb-10 space-y-4">
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-nova-cyan/20 border border-nova-cyan/30 text-[8px] font-black uppercase tracking-widest text-nova-cyan backdrop-blur-md">
              {project.project_type}
            </span>
            <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/60 backdrop-blur-md flex items-center gap-1.5">
              {project.visibility === 'Public' ? <Globe size={8} /> : <Lock size={8} />}
              {project.visibility}
            </span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight leading-none">{project.title}</h1>
          <p className="text-sm text-white/60 uppercase tracking-widest leading-relaxed max-w-sm">
            {project.short_description}
          </p>
        </div>
      </section>

      <main className="px-6 py-10 space-y-12">
        {/* Statistics Section */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-6">Node Analytics</h2>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col gap-2">
                <stat.icon size={16} className="text-nova-cyan" />
                <div>
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/40">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Section (Placeholder) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Latest Updates</h2>
            <button className="text-[8px] font-black uppercase tracking-widest text-white/20 flex items-center gap-2">
              View All <ArrowRight size={10} />
            </button>
          </div>
          <div className="aspect-video rounded-[3rem] border border-white/5 flex flex-col items-center justify-center text-center p-8 bg-white/[0.02] relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-nova-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <RefreshCw size={24} className="text-white/10 mb-4 animate-spin-slow" />
            <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">No transmission history found</p>
            <p className="mt-2 text-[8px] text-white/10 uppercase tracking-widest">Awaiting node synchronization...</p>
          </div>
        </section>

        {/* Project Highlights (Placeholder) */}
        <section className="space-y-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Node Highlights</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6">
            {[
              { label: 'Research', color: 'bg-nova-purple' },
              { label: 'Milestones', color: 'bg-nova-cyan' },
              { label: 'Innovations', color: 'bg-nova-green' }
            ].map((item, i) => (
              <div key={i} className="min-w-[280px] aspect-[4/5] rounded-[3rem] bg-white/5 border border-white/5 p-8 flex flex-col justify-end group hover:border-white/10 transition-all">
                <div className={`w-12 h-12 rounded-2xl ${item.color}/10 border ${item.color.replace('bg-', 'border-')}/20 mb-6 flex items-center justify-center`}>
                   <div className={`w-2 h-2 rounded-full ${item.color} animate-pulse`} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white/60 mb-2">{item.label}</h3>
                <div className="h-1 w-12 bg-white/10 rounded-full mb-6" />
                <div className="space-y-2">
                   <div className="h-2 w-full bg-white/5 rounded-full" />
                   <div className="h-2 w-2/3 bg-white/5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-black px-6 py-16 space-y-12">
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-nova-cyan flex items-center justify-center text-black font-black italic text-xl">
                N
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight">{project.title}</h3>
                <p className="text-[8px] text-white/40 uppercase tracking-widest">{project.category}</p>
              </div>
            </div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
              Powered by NOVA Innovation Ecosystem. All rights reserved.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-white/60">Node Links</h4>
              <nav className="flex flex-col gap-3">
                {['Overview', 'Research', 'Roadmap', 'Team'].map((link) => (
                  <button key={link} className="text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-nova-cyan text-left">
                    {link}
                  </button>
                ))}
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-white/60">Ecosystem</h4>
              <nav className="flex flex-col gap-3">
                {['Feed', 'Gallery', 'Surveys', 'Help'].map((link) => (
                  <button key={link} className="text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-nova-cyan text-left">
                    {link}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
            <div className="flex flex-wrap gap-4">
              {[LinkIcon, Instagram, XIcon, Linkedin, Facebook, Youtube, Github].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 hover:text-nova-cyan hover:border-nova-cyan/30 transition-all">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[8px] font-black uppercase tracking-widest text-white/20">
            © {new Date().getFullYear()} NOVA NETWORK
          </p>
          <div className="flex gap-4">
            <button className="text-[8px] font-black uppercase tracking-widest text-white/20">Privacy</button>
            <button className="text-[8px] font-black uppercase tracking-widest text-white/20">Protocol</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
