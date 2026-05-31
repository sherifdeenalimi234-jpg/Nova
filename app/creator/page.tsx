"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Plus,
  FileText,
  Briefcase,
  Search,
  TrendingUp,
  Users,
  Eye,
  ArrowUpRight,
  User
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*, creator_profiles(*)')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  return (
    <div className="space-y-10">
      {/* Creator Status Section - Mobile Only */}
      {!loading && profile && (
        <section className="lg:hidden p-6 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-nova-cyan/5 to-nova-purple/5 backdrop-blur-xl mb-6">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl border border-white/10 overflow-hidden bg-white/5">
                    {profile.avatar_url ? (
                       <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center">
                          <User size={20} className="text-white/20" />
                       </div>
                    )}
                 </div>
                 <div>
                    <h2 className="text-sm font-black uppercase tracking-widest">{profile.full_name}</h2>
                    <p className="text-[9px] text-nova-cyan font-black uppercase tracking-[0.2em]">{profile.professional_title || 'Innovation Architect'}</p>
                 </div>
              </div>
              {profile.verification_status === 'approved' && (
                 <div className="px-3 py-1 rounded-full bg-nova-cyan/20 border border-nova-cyan/30">
                    <span className="text-[8px] font-black uppercase tracking-widest text-nova-cyan">Verified</span>
                 </div>
              )}
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                 <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">Node Level</p>
                 <p className="text-xs font-black">Level 1 Node</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                 <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">Status</p>
                 <p className="text-xs font-black text-nova-green">ACTIVE</p>
              </div>
           </div>
        </section>
      )}

      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Command Center</h1>
           <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Manage your innovation ecosystem</p>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-3 rounded-2xl border border-white/10 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
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
        <section className="lg:col-span-2 p-8 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
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
