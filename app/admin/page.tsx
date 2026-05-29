import React from 'react';
import { motion } from "framer-motion";
import { createClient } from '@/lib/supabase/server';
import EcosystemVitality from '@/components/admin/EcosystemVitality';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Users,
  ShieldCheck,
  BarChart3,
  MessageSquare,
  Zap,
  ArrowUpRight,
  Shield,
  ChevronRight,
  LayoutDashboard,
  Bell,
  Activity
} from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch Stats
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: premiumUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified_creator', true);

  const { count: activeSurveys } = await supabase
    .from('surveys')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open');

  const { count: pendingPostsCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const stats = [
    { label: 'Total Ecosystem Nodes', value: totalUsers || 0, icon: Users, color: 'text-nova-cyan', href: '/admin/users' },
    { label: 'Verified Intelligence', value: premiumUsers || 0, icon: ShieldCheck, color: 'text-nova-purple', href: '/admin/creators' },
    { label: 'Active Protocols', value: activeSurveys || 0, icon: BarChart3, color: 'text-nova-green', href: '/admin/surveys' },
    { label: 'Pending Validations', value: pendingPostsCount || 0, icon: MessageSquare, color: 'text-nova-orange', href: '/admin/content' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 md:space-y-10"
    >
      {/* Cinematic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-nova-cyan animate-pulse" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-nova-cyan/60">Intelligence Status: Optimal</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
            Mission <span className="text-nova-cyan">Control</span>
          </h1>
          <p className="text-white/40 mt-3 tracking-[0.2em] uppercase text-[9px] md:text-[10px]">
            Ecosystem Synchronization Active • Secure Node 01
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 md:px-6 py-3 md:py-4 rounded-2xl backdrop-blur-xl self-start md:self-auto">
          <div className="text-right">
            <div className="text-[8px] md:text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">Security Level</div>
            <div className="text-xs md:text-sm font-black text-nova-green uppercase tracking-tighter">Maximum Protocol</div>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-nova-green/30 flex items-center justify-center bg-nova-green/5">
            <Shield size={16} className="md:size-20 text-nova-green" />
          </div>
        </div>
      </div>

      {/* Realtime Stats Grid - Stacked on Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <Link key={i} href={stat.href}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 + 0.2 }}
              className="group relative p-5 md:p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md hover:border-white/20 transition-all duration-500 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 transition-opacity group-hover:opacity-40 ${stat.color.replace('text', 'bg')}`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className={`p-2 rounded-xl bg-white/5 ${stat.color} border border-white/10`}>
                    <stat.icon size={18} />
                  </div>
                  <div className="text-white/20 group-hover:text-white transition-colors">
                     <ArrowUpRight size={14} />
                  </div>
                </div>
                <div className="text-white/40 text-[9px] md:text-[10px] uppercase tracking-widest mb-1 font-bold">
                  {stat.label}
                </div>
                <div className={`text-3xl md:text-4xl font-black tracking-tighter ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Main Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
         {/* Vitality Graph */}
         <div className="lg:col-span-2 p-6 md:p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div>
                <h3 className="text-base md:text-lg font-bold tracking-widest uppercase text-white leading-none">Ecosystem Vitality</h3>
                <p className="text-[9px] md:text-[10px] text-white/30 uppercase tracking-widest mt-2">Real-time interaction matrix</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-nova-cyan shadow-[0_0_8px_#00f2ff]" />
                <span className="text-[8px] md:text-[9px] font-bold text-white/40 uppercase">Live</span>
              </div>
            </div>
            <EcosystemVitality />
         </div>

         {/* System Alerts / Quick Actions */}
         <div className="p-6 md:p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl space-y-6">
            <h3 className="text-base md:text-lg font-bold tracking-widest uppercase text-white leading-none mb-2 md:mb-4">System Alerts</h3>

            <div className="space-y-3 md:space-y-4">
               {[
                 { title: 'Security Audit', desc: 'All nodes verified successfully.', type: 'success' },
                 { title: 'Protocol Update', desc: 'L7 routing optimized for low latency.', type: 'info' },
                 { title: 'Sync Warning', desc: 'Minor node latency in Sector 4.', type: 'warning' },
               ].map((alert, i) => (
                 <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className={cn(
                      "text-[9px] font-black uppercase tracking-widest mb-1",
                      alert.type === 'success' ? 'text-nova-green' :
                      alert.type === 'warning' ? 'text-nova-orange' : 'text-nova-cyan'
                    )}>
                      {alert.title}
                    </div>
                    <p className="text-[10px] md:text-[11px] text-white/40 leading-relaxed">{alert.desc}</p>
                 </div>
               ))}
            </div>

            <div className="pt-2 md:pt-4 space-y-3">
               <Link href="/admin/settings" className="flex items-center justify-between p-4 rounded-2xl bg-nova-cyan/5 border border-nova-cyan/20 group hover:bg-nova-cyan/10 transition-all">
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-nova-cyan">Global Protocols</span>
                  <ChevronRight size={14} className="text-nova-cyan group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
