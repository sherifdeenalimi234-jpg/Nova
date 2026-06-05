"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Activity,
  FileText,
  MessageSquare,
  ArrowRight,
  Plus,
  Rocket,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  total: number;
  active: number;
  drafts: number;
  responses: number;
}

export default function SurveyDashboard({
  stats,
  recentActivity,
  user
}: {
  stats: DashboardStats;
  recentActivity: any[];
  user: any;
}) {
  const metricCards = [
    { label: 'Total Surveys', value: stats.total, icon: ClipboardList, color: 'text-nova-cyan', bg: 'bg-nova-cyan/10' },
    { label: 'Active Signals', value: stats.active, icon: Rocket, color: 'text-nova-green', bg: 'bg-nova-green/10' },
    { label: 'Pending Drafts', value: stats.drafts, icon: FileText, color: 'text-nova-orange', bg: 'bg-nova-orange/10' },
    { label: 'Total Intake', value: stats.responses, icon: MessageSquare, color: 'text-nova-purple', bg: 'bg-nova-purple/10' },
  ];

  return (
    <div className="space-y-10 pb-24">
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Survey <span className="text-nova-cyan">Dashboard</span></h1>
           <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Welcome back, {user?.full_name || 'Architect'}</p>
        </div>
        <Link href="/survey/create" className="px-6 py-3 rounded-2xl bg-nova-purple text-white text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] transition-all flex items-center gap-2 self-start">
           <Plus size={14} />
           Architect Survey
        </Link>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {metricCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity ${card.color}`}>
               <card.icon size={48} />
            </div>
            <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center mb-4 border border-white/5`}>
               <card.icon size={20} />
            </div>
            <div className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">{card.label}</div>
            <div className="text-2xl font-black">{card.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Quick Links */}
         <section className="lg:col-span-1 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-6 flex items-center gap-2">
               <Activity size={14} className="text-nova-cyan" />
               Operations Center
            </h3>
            <div className="grid grid-cols-1 gap-3">
               {[
                 { label: 'Manage All', href: '/survey/manage', icon: ClipboardList, desc: 'Update status and settings' },
                 { label: 'View Published', href: '/survey/manage?status=published', icon: Rocket, desc: 'Monitor active signals' },
                 { label: 'Continue Drafts', href: '/survey/manage?status=draft', icon: FileText, desc: 'Finalize your designs' },
               ].map((action, i) => (
                 <Link
                   key={i}
                   href={action.href}
                   className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-nova-purple/30 transition-all group flex items-center justify-between"
                 >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-nova-purple transition-colors">
                          <action.icon size={20} />
                       </div>
                       <div>
                          <div className="text-[10px] font-black uppercase tracking-widest">{action.label}</div>
                          <div className="text-[9px] text-white/20 uppercase tracking-widest mt-0.5">{action.desc}</div>
                       </div>
                    </div>
                    <ArrowRight size={16} className="text-white/10 group-hover:translate-x-1 group-hover:text-nova-purple transition-all" />
                 </Link>
               ))}
            </div>
         </section>

         {/* Recent Activity */}
         <section className="lg:col-span-2 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-6 flex items-center gap-2">
               <Clock size={14} className="text-nova-purple" />
               Recent Intelligence Log
            </h3>
            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
               {recentActivity.length === 0 ? (
                 <div className="py-20 text-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/20">No recent activity detected</p>
                 </div>
               ) : (
                 <div className="divide-y divide-white/5">
                    {recentActivity.map((survey) => (
                       <Link
                         key={survey.id}
                         href={`/survey/manage/${survey.id}`}
                         className="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-colors group"
                       >
                          <div className="flex items-center gap-6">
                             <div className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${
                                survey.status === 'published' ? 'bg-nova-green/10 text-nova-green border border-nova-green/20' :
                                survey.status === 'closed' ? 'bg-white/5 text-white/40' :
                                'bg-nova-orange/10 text-nova-orange border border-nova-orange/20'
                             }`}>
                                {survey.status}
                             </div>
                             <div>
                                <h4 className="text-sm font-bold group-hover:text-nova-cyan transition-colors">{survey.title}</h4>
                                <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">
                                   Modified {formatDistanceToNow(new Date(survey.updated_at))} ago
                                </p>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="text-right hidden md:block">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Type</p>
                                <p className="text-[9px] text-nova-cyan font-bold uppercase">{survey.category}</p>
                             </div>
                             <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:border-nova-cyan group-hover:text-nova-cyan transition-all">
                                <ArrowRight size={16} />
                             </div>
                          </div>
                       </Link>
                    ))}
                 </div>
               )}
            </div>
         </section>
      </div>
    </div>
  );
}
