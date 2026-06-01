"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProject } from '@/lib/actions/projects';
import {
  Loader2,
  Calendar,
  Globe,
  Lock,
  Briefcase,
  Users,
  FileText,
  Activity,
  Zap,
  ChevronRight,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
  Github,
  Globe as GlobeIcon
} from 'lucide-react';
import ProjectTopBar from '@/components/projects/ProjectTopBar';
import { motion } from 'framer-motion';

interface ProjectMember {
  id: string;
  user_id: string;
  role: string;
}

interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  category: string;
  visibility: 'Public' | 'Private' | 'Team Only';
  project_type: string;
  cover_image?: string;
  project_members?: ProjectMember[];
}

export default function ProjectWebsiteHomePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
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
        <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mb-8">The innovation node you are looking for does not exist or is restricted.</p>
        <button onClick={() => router.push('/projects')} className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest">
          Return to Hub
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Members', value: project.project_members?.length || 1, icon: Users },
    { label: 'Files', value: '0', icon: FileText },
    { label: 'Activities', value: '0', icon: Activity },
    { label: 'Updates', value: '0', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-0">
      <ProjectTopBar title={project.title} />

      {/* Hero Section */}
      <section className="relative h-[60vh] w-full pt-16 overflow-hidden">
        {project.cover_image ? (
          <img src={project.cover_image} className="w-full h-full object-cover" alt={project.title} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-nova-cyan/20 to-nova-purple/20 flex items-center justify-center">
            <Briefcase size={80} className="text-white/5" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />

        <div className="absolute bottom-10 left-6 right-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-nova-cyan/20 border border-nova-cyan/30 text-[8px] font-black uppercase tracking-widest text-nova-cyan">
                {project.project_type}
              </span>
              <span className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                project.visibility === 'Public'
                ? 'bg-nova-green/10 border-nova-green/20 text-nova-green'
                : 'bg-nova-purple/10 border-nova-purple/20 text-nova-purple'
              }`}>
                {project.visibility === 'Public' ? <Globe size={10} /> : <Lock size={10} />}
                {project.visibility}
              </span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight leading-none">{project.title}</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-nova-cyan">{project.category}</p>
            <p className="text-xs leading-relaxed text-white/60 uppercase tracking-widest max-w-sm line-clamp-3">
              {project.short_description}
            </p>
          </motion.div>
        </div>
      </section>

      <main className="px-6 space-y-12 py-10">
        {/* Statistics Section */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-6">Node Metrics</h2>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center text-center">
                <stat.icon size={20} className="text-white/20 mb-3" />
                <p className="text-xl font-black mb-1">{stat.value}</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Featured Intel</h2>
            <div className="h-px flex-1 bg-white/5 mx-4" />
          </div>
          <div className="aspect-video w-full rounded-[2.5rem] bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-8">
            <Zap size={32} className="text-white/5 mb-4" />
            <h3 className="text-xs font-black uppercase tracking-widest mb-2 text-white/40">No Featured Content</h3>
            <p className="text-[8px] text-white/20 uppercase tracking-[0.2em]">High-impact updates will appear here</p>
          </div>
        </section>

        {/* Highlights Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Research Highlights</h2>
            <div className="h-px flex-1 bg-white/5 mx-4" />
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center gap-4 opacity-50">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                  <Activity size={18} className="text-white/20" />
                </div>
                <div className="flex-1">
                  <div className="h-2 w-24 bg-white/10 rounded mb-2" />
                  <div className="h-1.5 w-full bg-white/5 rounded" />
                </div>
                <ChevronRight size={16} className="text-white/10" />
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Mandatory Footer */}
      <footer className="mt-10 bg-[#0a0a0a] border-t border-white/5 pt-16 pb-12 px-8">
        <div className="space-y-12 max-w-lg mx-auto">
          {/* Project Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-nova-cyan/20 flex items-center justify-center">
                <Briefcase size={16} className="text-nova-cyan" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest">{project.title}</h3>
            </div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
              An innovation node powered by the NOVA ecosystem. Built for the next generation of creators.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10">
            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20">Protocol</h4>
              <div className="flex flex-col gap-3">
                <button className="text-left text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-nova-cyan transition-colors">About Node</button>
                <button className="text-left text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-nova-cyan transition-colors">Roadmap</button>
                <button className="text-left text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-nova-cyan transition-colors">Contributors</button>
              </div>
            </div>

            {/* Social Connect (Placeholders) */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20">Connect</h4>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: GlobeIcon, color: 'hover:text-nova-cyan' },
                  { icon: Github, color: 'hover:text-white' },
                  { icon: Instagram, color: 'hover:text-pink-500' },
                  { icon: Linkedin, color: 'hover:text-blue-500' },
                  { icon: Facebook, color: 'hover:text-blue-600' },
                  { icon: Youtube, color: 'hover:text-red-500' },
                  { icon: Activity, color: 'hover:text-nova-purple' },
                ].map((social, i) => (
                  <button key={i} className={`text-white/20 transition-colors ${social.color}`}>
                    <social.icon size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">
              © {new Date().getFullYear()} NOVA SYSTEM • ALL RIGHTS RESERVED
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
