import React from 'react';
import { createClient } from '@/lib/supabase/server';
import {
  BarChart3,
  PieChart,
  ArrowUpRight,
  Search,
  Filter,
  Download,
  Calendar,
  Eye,
  Settings,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { moderateSurvey } from '@/lib/actions/admin';
import { motion } from "framer-motion";
import { cn } from '@/lib/utils';

export default async function AdminSurveysPage() {
  const supabase = await createClient();

  const { data: surveys } = await supabase
    .from('surveys')
    .select('*, profiles:creator_id(full_name)')
    .order('created_at', { ascending: false });

  const stats = [
    { label: 'Protocols Active', value: surveys?.length || 0, icon: BarChart3, color: 'text-nova-cyan' },
    { label: 'Total Intake', value: '1,284', icon: TrendingUp, color: 'text-nova-purple' },
    { label: 'System Reach', value: '94%', icon: Activity, color: 'text-nova-green' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 md:space-y-10"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
            Survey <span className="text-nova-cyan">Intelligence</span>
          </h1>
          <p className="text-white/40 mt-3 tracking-[0.2em] uppercase text-[9px] md:text-[10px] font-medium">
            Ecosystem Insight Matrix • Analytics Engine
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all self-start md:self-auto w-full md:w-auto">
           <Download size={14} /> Export Protocol Data
        </button>
      </div>

      {/* Stats Grid - Horizontal Scroll on Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 md:p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col md:block"
          >
             <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl bg-white/5 ${stat.color} border border-white/10`}>
                   <stat.icon size={18} />
                </div>
                <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Live Sync</div>
             </div>
             <div>
                <div className="text-white/40 text-[9px] md:text-[10px] uppercase tracking-widest mb-1 font-bold">{stat.label}</div>
                <div className={`text-2xl md:text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</div>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Survey List - Mobile Cards */}
      <div className="space-y-6">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h3 className="text-base md:text-lg font-bold tracking-widest uppercase text-white leading-none">Protocol Directory</h3>

            <div className="relative group w-full md:max-w-md">
               <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-nova-cyan transition-colors" />
               <input
                  type="text"
                  placeholder="Filter protocols..."
                  className="w-full bg-white/2 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-[11px] uppercase tracking-widest text-white placeholder:text-white/20 outline-none focus:border-nova-cyan/50 transition-all"
               />
            </div>
         </div>

         <div className="grid gap-4">
            {surveys?.map((survey, i) => (
               <motion.div
                 key={survey.id}
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.05 }}
                 className="p-5 md:p-6 rounded-[2rem] bg-white/2 border border-white/5 hover:border-white/10 transition-all group"
               >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                           <span className={cn(
                              "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                              survey.status === 'open'
                                 ? "bg-nova-green/10 text-nova-green border-nova-green/20"
                                 : "bg-red-500/10 text-red-500 border-red-500/20"
                           )}>
                              {survey.status}
                           </span>
                           <div className="flex items-center gap-1.5 text-[8px] text-white/20 font-black uppercase tracking-widest">
                              <Calendar size={10} />
                              {new Date(survey.created_at).toLocaleDateString()}
                           </div>
                        </div>
                        <h4 className="text-sm md:text-base font-bold text-white mb-2 leading-snug group-hover:text-nova-cyan transition-colors">{survey.title}</h4>
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-lg bg-nova-cyan/10 border border-nova-cyan/20 flex items-center justify-center text-[10px] font-black text-nova-cyan">
                              {survey.profiles?.full_name?.charAt(0) || 'N'}
                           </div>
                           <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{survey.profiles?.full_name || 'System'}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-3 border-t border-white/5 md:border-none pt-4 md:pt-0">
                        <div className="flex-1 md:flex-none grid grid-cols-2 gap-3">
                           <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                              <div className="text-[10px] font-black text-white mb-0.5">342</div>
                              <div className="text-[8px] text-white/20 uppercase tracking-widest font-black">Intake</div>
                           </div>
                           <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                              <div className="text-[10px] font-black text-white mb-0.5">82%</div>
                              <div className="text-[8px] text-white/20 uppercase tracking-widest font-black">Comp</div>
                           </div>
                        </div>
                        <div className="w-px h-8 bg-white/10 hidden md:block" />
                        <div className="flex items-center gap-2">
                           <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/30 hover:text-nova-cyan hover:border-nova-cyan/20 transition-all">
                              <Eye size={16} />
                           </button>
                           <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/30 hover:text-nova-purple hover:border-nova-purple/20 transition-all">
                              <Settings size={16} />
                           </button>
                        </div>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>
    </motion.div>
  );
}
