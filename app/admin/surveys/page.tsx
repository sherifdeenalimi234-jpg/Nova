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
  MoreHorizontal
} from 'lucide-react';
import { moderateSurvey } from '@/lib/actions/admin';
import * as motion from "framer-motion/client";
import { cn } from '@/lib/utils';

export default async function AdminSurveysPage() {
  const supabase = await createClient();

  const { data: surveys } = await supabase
    .from('surveys')
    .select('*, profiles:creator_id(full_name)')
    .order('created_at', { ascending: false });

  const stats = [
    { label: 'Total Surveys', value: surveys?.length || 0, icon: BarChart3, color: 'text-nova-cyan' },
    { label: 'Active Protocols', value: surveys?.filter(s => s.status === 'open').length || 0, icon: PieChart, color: 'text-nova-green' },
    { label: 'Total Responses', value: '1,284', icon: ArrowUpRight, color: 'text-nova-purple' },
    { label: 'Average Completion', value: '84%', icon: Filter, color: 'text-nova-orange' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            Survey <span className="text-nova-cyan">Intelligence</span>
          </h1>
          <p className="text-white/40 mt-2 tracking-[0.2em] uppercase text-[10px]">
            Ecosystem Insight Matrix • Analytics Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
             <Download size={14} /> Export Global Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md"
          >
             <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl bg-white/5 ${stat.color} border border-white/10`}>
                   <stat.icon size={18} />
                </div>
             </div>
             <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1 font-bold">{stat.label}</div>
             <div className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Survey Directory */}
      <div className="p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h3 className="text-lg font-bold tracking-widest uppercase text-white">Protocol Directory</h3>

            <div className="flex flex-col md:flex-row gap-4">
               <div className="relative group min-w-[300px]">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-nova-cyan transition-colors" />
                  <input
                     type="text"
                     placeholder="Filter protocols..."
                     className="w-full bg-white/2 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs uppercase tracking-widest text-white placeholder:text-white/20 outline-none focus:border-nova-cyan/50 focus:bg-white/5 transition-all"
                  />
               </div>
               <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all">
                  <Filter size={18} />
               </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
               <thead>
                  <tr className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-black">
                     <th className="px-6 py-2">Protocol Name</th>
                     <th className="px-6 py-2">Lead Investigator</th>
                     <th className="px-6 py-2">Deployment Date</th>
                     <th className="px-6 py-2">Status</th>
                     <th className="px-6 py-2 text-right">Operations</th>
                  </tr>
               </thead>
               <tbody>
                  {surveys?.map((survey) => (
                     <tr key={survey.id} className="group transition-all hover:bg-white/5">
                        <td className="px-6 py-5 rounded-l-2xl border-y border-l border-white/5 bg-white/2 group-hover:border-white/10 group-hover:bg-transparent">
                           <div className="text-xs font-bold text-white group-hover:text-nova-cyan transition-colors">{survey.title}</div>
                        </td>
                        <td className="px-6 py-5 border-y border-white/5 bg-white/2 group-hover:border-white/10 group-hover:bg-transparent">
                           <div className="text-[10px] text-white/60 font-medium">{survey.profiles?.full_name}</div>
                        </td>
                        <td className="px-6 py-5 border-y border-white/5 bg-white/2 group-hover:border-white/10 group-hover:bg-transparent">
                           <div className="flex items-center gap-2 text-[10px] text-white/40">
                              <Calendar size={12} />
                              {new Date(survey.created_at).toLocaleDateString()}
                           </div>
                        </td>
                        <td className="px-6 py-5 border-y border-white/5 bg-white/2 group-hover:border-white/10 group-hover:bg-transparent">
                           <span className={cn(
                              "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                              survey.status === 'open'
                                 ? "bg-nova-green/10 text-nova-green border-nova-green/20"
                                 : "bg-red-500/10 text-red-500 border-red-500/20"
                           )}>
                              {survey.status}
                           </span>
                        </td>
                        <td className="px-6 py-5 rounded-r-2xl border-y border-r border-white/5 bg-white/2 group-hover:border-white/10 group-hover:bg-transparent text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/30 hover:text-nova-cyan hover:border-nova-cyan/20 transition-all">
                                 <Eye size={14} />
                              </button>
                              <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/30 hover:text-nova-purple hover:border-nova-purple/20 transition-all">
                                 <Settings size={14} />
                              </button>
                              <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/30 hover:text-white transition-all">
                                 <MoreHorizontal size={14} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
