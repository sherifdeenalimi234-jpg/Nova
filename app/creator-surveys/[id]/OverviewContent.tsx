"use client";

import React from 'react';
import {
  Target,
  Users,
  BarChart3,
  GitBranch,
  Edit3,
  Send,
  UserPlus,
  Clock,
  Globe,
  Tag,
  ArrowUpRight,
  Activity,
  Zap,
  Layout,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Survey } from '@/lib/types/surveys';
import Link from 'next/link';

export default function OverviewContent({ survey }: { survey: Survey }) {
  if (!survey) return null;

  const responseCount = survey.response_count || 0;
  const targetResponses = (survey.target_responses && !isNaN(parseInt(survey.target_responses)))
    ? parseInt(survey.target_responses)
    : 0;
  const progress = targetResponses > 0 ? Math.min((responseCount / targetResponses) * 100, 100) : 0;
  const isSchemaFallback = typeof survey.research_objective === 'string' && survey.research_objective.includes("Schema mismatch");

  const stats = [
    { label: 'Completion Rate', value: '0%', icon: Activity, color: 'text-nova-cyan' },
    { label: 'Avg. Duration', value: '0m', icon: Clock, color: 'text-nova-purple' },
    { label: 'Drop-off Rate', value: '0%', icon: Zap, color: 'text-nova-green' },
  ];

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* 1. HERO SECTION: Summary & Primary Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 p-8 lg:p-12 rounded-[2.5rem] bg-gradient-to-br from-nova-purple/10 via-transparent to-transparent border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Layout size={120} className="text-nova-purple rotate-12" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight mb-4">Workspace Overview</h2>
            <p className="text-white/40 text-[10px] lg:text-xs uppercase tracking-[0.4em] mb-10">Intelligence Node: {survey.id}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Builder', icon: Edit3, color: 'bg-nova-cyan/20 text-nova-cyan', path: '/build' },
                { label: 'Logic', icon: GitBranch, color: 'bg-nova-purple/20 text-nova-purple', path: '/logic' },
                { label: 'Collect', icon: Send, color: 'bg-nova-green/20 text-nova-green', path: '/collect' },
                { label: 'AI Lab', icon: Sparkles, color: 'bg-white/10 text-white/40', path: '/ai-lab' },
              ].map((action, idx) => (
                <Link
                  key={idx}
                  href={`/creator-surveys/${survey.id}${action.path}`}
                  className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all group/btn"
                >
                  <div className={`w-12 h-12 rounded-2xl ${action.color} flex items-center justify-center group-hover/btn:scale-110 transition-transform`}>
                    <action.icon size={22} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 lg:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col justify-between relative overflow-hidden group">
           <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Target Response Progress</h3>
                <BarChart3 size={16} className="text-nova-cyan" />
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black tracking-tighter">{responseCount}</span>
                <span className="text-lg font-bold text-white/20 uppercase">/ {targetResponses || '--'}</span>
              </div>
              <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">
                {responseCount > 0 ? 'Data stream active' : 'Data stream inactive'}
              </p>
           </div>
           <div className="relative z-10 space-y-4">
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                 <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-nova-cyan shadow-[0_0_15px_rgba(0,242,255,0.5)]"
                 />
              </div>
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/20">
                 <span>Initiated</span>
                 <span>Target Reached</span>
              </div>
           </div>
        </div>
      </section>

      {/* 2. METRICS ROW */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-6 rounded-[2rem] bg-white/[0.01] border border-white/5 flex items-center gap-6 group hover:bg-white/[0.03] transition-all">
            <div className={`w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">{stat.label}</p>
              <p className="text-xl font-black">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* 3. INFORMATION GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Blueprint Details */}
        <div className="lg:col-span-8 space-y-6">
           {isSchemaFallback && (
             <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center gap-4">
                <AlertCircle size={20} />
                <div className="flex-1">
                   <p className="text-[10px] font-black uppercase tracking-widest mb-1">Schema Mismatch Detected</p>
                   <p className="text-[9px] opacity-80 uppercase leading-relaxed font-bold">Some blueprint fields are missing in your database. Run "Sync Schema" in the hub to repair.</p>
                </div>
             </div>
           )}
           <div className="p-8 lg:p-12 rounded-[3rem] bg-white/[0.01] border border-white/5 space-y-10">
              <div className="space-y-6">
                 <div className="flex items-center gap-3 text-nova-cyan">
                    <div className="p-2 rounded-lg bg-nova-cyan/10">
                      <Layers size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Research Objective</span>
                 </div>
                 <p className="text-base lg:text-lg leading-relaxed text-white/60 font-medium">
                   {survey.research_objective || "No objective defined for this research node."}
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-white/5">
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white/40">
                       <Target size={16} />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Collection Mode</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <p className="text-sm font-black uppercase tracking-tight">{survey.survey_mode || 'Standard'}</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white/40">
                       <Users size={16} />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Target Audience</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <p className="text-sm font-black uppercase tracking-tight">{survey.target_audience || 'General'}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Side Parameters */}
        <div className="lg:col-span-4 space-y-6">
           <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Blueprint Data</h3>
                <Link href={`/creator-surveys/${survey.id}/settings`} className="text-[8px] font-black uppercase tracking-widest text-nova-cyan hover:underline">Edit Blueprint</Link>
              </div>

              <ul className="space-y-6">
                 {[
                   { label: 'Duration', value: survey.estimated_duration || "N/A", icon: Clock },
                   { label: 'Language', value: survey.language || "English", icon: Globe },
                   { label: 'Category', value: survey.research_category || "General", icon: Tag },
                   { label: 'Visibility', value: survey.visibility || "Private", icon: Globe },
                 ].map((item, idx) => (
                   <li key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3 text-white/20 group-hover:text-white/40 transition-colors">
                         <item.icon size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-tighter">{item.value}</span>
                   </li>
                 ))}
              </ul>
           </div>

           <Link href={`/creator-surveys/${survey.id}/collect`} className="block p-8 rounded-[2.5rem] bg-nova-purple text-center hover:shadow-[0_15px_40px_rgba(188,19,254,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="flex items-center justify-center gap-4 relative z-10">
                 <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                 <span className="text-xs font-black uppercase tracking-[0.4em]">Launch Survey</span>
              </div>
           </Link>

           <button className="w-full flex items-center justify-center gap-3 p-6 rounded-[2rem] bg-white/5 hover:bg-white/10 transition-all border border-white/5">
              <UserPlus size={18} className="text-white/40" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Invite Collaborators</span>
           </button>
        </div>
      </section>

      {/* 4. RECENT ACTIVITY PREVIEW */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Recent Node Activity</h3>
          <ArrowUpRight size={16} className="text-white/20" />
        </div>
        <div className="p-12 rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-center">
           <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white/10 mb-6">
              <Activity size={32} />
           </div>
           <h4 className="text-sm font-black uppercase tracking-widest mb-2">No activity recorded</h4>
           <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Node established. awaiting data stream initialization.</p>
        </div>
      </section>

    </div>
  );
}
