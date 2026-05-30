"use client";

import React, { useState, useEffect } from 'react';
import {
  Plus,
  FileText,
  Briefcase,
  Search,
  TrendingUp,
  Users,
  Eye,
  ArrowUpRight,
  User,
  ShieldCheck,
  Zap,
  Globe,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const data = [
  { name: 'Mon', views: 400 },
  { name: 'Tue', views: 300 },
  { name: 'Wed', views: 900 },
  { name: 'Thu', views: 500 },
  { name: 'Fri', views: 1200 },
  { name: 'Sat', views: 800 },
  { name: 'Sun', views: 1500 },
];

export default function CreatorDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    }
    fetchProfile();
  }, []);

  return (
    <div className="space-y-10 pb-10">
      {/* Mobile Creator Identity Section */}
      <section className="lg:hidden -mx-6 -mt-6 p-8 bg-gradient-to-b from-nova-cyan/5 to-transparent border-b border-white/5 mb-10">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-nova-cyan/20 blur-2xl rounded-full" />
            <div className="relative w-24 h-24 rounded-[2rem] border border-white/10 p-1 bg-black/50 overflow-hidden">
               {profile?.avatar_url ? (
                 <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-[1.8rem]" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-[1.8rem]">
                   <User size={32} className="text-white/10" />
                 </div>
               )}
            </div>
            {profile?.is_verified_creator && (
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-nova-cyan flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.4)] border-2 border-black">
                <ShieldCheck size={20} className="text-black" />
              </div>
            )}
          </div>

          <div>
             <div className="flex items-center justify-center gap-2 mb-2">
                <h1 className="text-2xl font-black uppercase tracking-tight">{profile?.full_name || "Syncing..."}</h1>
             </div>
             <p className="text-nova-cyan text-[9px] font-black uppercase tracking-[0.4em] mb-4">
                {profile?.professional_title || "Innovation Node"}
             </p>

             <div className="flex items-center justify-center gap-3">
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex flex-col items-center">
                   <span className="text-[6px] text-white/20 uppercase tracking-widest mb-1">Creator Level</span>
                   <div className="flex items-center gap-1.5">
                      <Zap size={10} className="text-nova-cyan" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/60">Level 1 Node</span>
                   </div>
                </div>
                <div className="px-4 py-2 rounded-full bg-nova-cyan/10 border border-nova-cyan/20 flex flex-col items-center">
                   <span className="text-[6px] text-nova-cyan/40 uppercase tracking-widest mb-1">Creator Status</span>
                   <div className="flex items-center gap-1.5">
                      <Award size={10} className="text-nova-cyan" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-nova-cyan">Verified Creator</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="hidden lg:block">
           <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Command Center</h1>
           <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Manage your innovation ecosystem</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
           <button className="flex-1 px-6 py-4 rounded-2xl bg-nova-cyan text-black text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all">
              Initiate Project
           </button>
           <button className="flex-1 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              Publish Research
           </button>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Engagement', value: '24.8K', icon: TrendingUp, color: 'text-nova-cyan', bg: 'bg-nova-cyan/10' },
          { label: 'Profile Nodes', value: '1,204', icon: Users, color: 'text-nova-purple', bg: 'bg-nova-purple/10' },
          { label: 'Research Reach', value: '852', icon: Eye, color: 'text-nova-green', bg: 'bg-nova-green/10' },
          { label: 'Active Surveys', value: '12', icon: Search, color: 'text-nova-orange', bg: 'bg-nova-orange/10' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="p-6 rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl group hover:border-white/10 transition-all"
          >
             <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-2xl ${stat.bg} flex items-center justify-center border border-white/5`}>
                   <stat.icon size={18} className={stat.color} />
                </div>
                <ArrowUpRight size={14} className="text-white/20 group-hover:text-white transition-colors" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{stat.label}</p>
             <h3 className="text-2xl font-black">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Preview */}
        <section className="lg:col-span-2 p-6 lg:p-8 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black uppercase tracking-widest">Ecosystem Visibility</h2>
              <select className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-nova-cyan focus:ring-0">
                 <option>Last 7 Days</option>
                 <option>Last 30 Days</option>
              </select>
           </div>
           <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data}>
                    <defs>
                       <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis
                       dataKey="name"
                       axisLine={false}
                       tickLine={false}
                       tick={{ fill: '#ffffff20', fontSize: 10, fontWeight: 900 }}
                       dy={10}
                    />
                    <Tooltip
                       contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                       itemStyle={{ color: '#00f2ff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                    />
                    <Area
                       type="monotone"
                       dataKey="views"
                       stroke="#00f2ff"
                       fillOpacity={1}
                       fill="url(#colorViews)"
                       strokeWidth={3}
                    />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </section>

        {/* Quick Actions / Recent Activity */}
        <section className="space-y-6">
           <div className="p-8 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl h-full">
              <h2 className="text-sm font-black uppercase tracking-widest mb-8">Recent Submissions</h2>
              <div className="space-y-6">
                 {[
                   { title: 'Nexus Protocol Alpha', type: 'Project', status: 'Approved', color: 'text-nova-green' },
                   { title: 'Neural Grid Dynamics', type: 'Research', status: 'Pending', color: 'text-nova-orange' },
                   { title: 'Ecosystem Survey v2', type: 'Survey', status: 'Live', color: 'text-nova-cyan' },
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between group cursor-pointer">
                      <div>
                         <h4 className="text-[11px] font-bold text-white group-hover:text-nova-cyan transition-colors">{item.title}</h4>
                         <p className="text-[8px] text-white/30 uppercase tracking-widest">{item.type}</p>
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-10 py-4 rounded-2xl border border-white/5 bg-white/2 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                 View All Activity
              </button>
           </div>
        </section>
      </div>

      {/* Quick Launch Grid */}
      <section>
         <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-8 ml-2">Quick Launch</h2>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Create Post', icon: FileText, href: '/creator/posts/new' },
              { name: 'Add Project', icon: Briefcase, href: '/creator/projects/new' },
              { name: 'Start Survey', icon: Search, href: '/creator/surveys/new' },
              { name: 'Edit Portfolio', icon: User, href: '/creator/portfolio' },
            ].map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] flex flex-col items-center gap-4 hover:border-nova-cyan/30 hover:bg-nova-cyan/[0.02] transition-all group"
              >
                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:text-nova-cyan transition-colors">
                    <action.icon size={20} />
                 </div>
                 <span className="text-[9px] font-black uppercase tracking-widest">{action.name}</span>
              </Link>
            ))}
         </div>
      </section>
    </div>
  );
}
