"use client";

import React from 'react';
import {
  Info,
  Target,
  Users,
  BarChart3,
  Layout,
  GitBranch,
  Send,
  UserPlus,
  Edit3,
  Clock,
  Globe,
  Tag
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Survey } from '@/lib/types/surveys';
import Link from 'next/link';

export default function OverviewContent({ survey }: { survey: Survey }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome & Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-8 rounded-[2rem] bg-gradient-to-br from-nova-purple/10 to-transparent border border-white/5">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Workspace Overview</h2>
          <p className="text-white/40 text-xs uppercase tracking-widest mb-6">Established Research Node: {survey.id}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href={`/creator-surveys/${survey.id}/architect`} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-nova-cyan/20 flex items-center justify-center text-nova-cyan group-hover:scale-110 transition-transform">
                <Edit3 size={20} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">Builder</span>
            </Link>
            <Link href={`/creator-surveys/${survey.id}/logic`} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-nova-purple/20 flex items-center justify-center text-nova-purple group-hover:scale-110 transition-transform">
                <GitBranch size={20} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">Logic</span>
            </Link>
            <Link href={`/creator-surveys/${survey.id}/analytics`} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-nova-green/20 flex items-center justify-center text-nova-green group-hover:scale-110 transition-transform">
                <BarChart3 size={20} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">Insights</span>
            </Link>
            <button className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/40 group-hover:scale-110 transition-transform">
                <UserPlus size={20} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">Team</span>
            </button>
          </div>
        </div>

        <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col justify-between">
           <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Collection Progress</h3>
              <div className="text-3xl font-black">0%</div>
              <p className="text-[10px] text-white/20 uppercase tracking-widest">0 of {survey?.target_responses || 0} Responses</p>
           </div>
           <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-6">
              <div className="h-full bg-nova-cyan w-0" />
           </div>
        </div>
      </section>

      {/* Survey Information */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
           <div className="p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/5 space-y-8">
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-nova-cyan">
                    <Info size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Research Objective</span>
                 </div>
                 <p className="text-sm leading-relaxed text-white/60">{survey?.research_objective || "No objective defined."}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white/40">
                       <Target size={16} />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Survey Mode</span>
                    </div>
                    <p className="text-sm font-bold">{survey?.survey_mode || "Standard Survey"}</p>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white/40">
                       <Users size={16} />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Target Audience</span>
                    </div>
                    <p className="text-sm font-bold">{survey?.target_audience || "Not specified"}</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Blueprint Parameters</h3>

              <ul className="space-y-4">
                 <li className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white/30">
                       <Clock size={14} />
                       <span className="text-[10px] font-medium">Duration</span>
                    </div>
                    <span className="text-[10px] font-bold">{survey?.estimated_duration || "N/A"}</span>
                 </li>
                 <li className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white/30">
                       <Globe size={14} />
                       <span className="text-[10px] font-medium">Language</span>
                    </div>
                    <span className="text-[10px] font-bold">{survey?.language || "English"}</span>
                 </li>
                 <li className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white/30">
                       <Tag size={14} />
                       <span className="text-[10px] font-medium">Category</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{survey?.research_category || "General"}</span>
                 </li>
              </ul>
           </div>

           <Link href={`/creator-surveys/${survey?.id}/collect`} className="block p-6 rounded-[2rem] bg-nova-purple text-center hover:shadow-[0_10px_30px_rgba(188,19,254,0.3)] transition-all group">
              <div className="flex items-center justify-center gap-3">
                 <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">Launch Survey</span>
              </div>
           </Link>
        </div>
      </section>
    </div>
  );
}
