"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Plus,
  FileText,
  Search,
  TrendingUp,
  Users,
  Eye,
  ArrowUpRight,
  User,
  LayoutDashboard,
  ClipboardList,
  CheckCircle2,
  FileEdit
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
import { getSurveyStats, getCreatorSurveys } from '@/lib/actions/surveys';
import { Survey, SurveyStats } from '@/lib/types/surveys';

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
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [recentSurveys, setRecentSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*, creator_profiles(*)')
          .eq('id', user.id)
          .single();
        setProfile(profileData);

        // Fetch Real Stats
        const statsRes = await getSurveyStats();
        if (statsRes.data) setStats(statsRes.data);

        // Fetch Recent Surveys
        const surveysRes = await getCreatorSurveys();
        if (surveysRes.data) setRecentSurveys(surveysRes.data.slice(0, 3));
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const skeletonClasses = "animate-pulse bg-white/5 rounded-2xl";

  return (
    <div className="space-y-6 lg:space-y-10">
      {/* Creator Status Section - Mobile Only */}
      {!loading && profile ? (
        <section className="lg:hidden p-5 rounded-[2rem] border border-white/5 bg-gradient-to-br from-nova-cyan/5 to-nova-purple/5 backdrop-blur-xl">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl border border-white/10 overflow-hidden bg-white/5">
                    {profile.avatar_url ? (
                       <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center">
                          <User size={16} className="text-white/20" />
                       </div>
                    )}
                 </div>
                 <div>
                    <h2 className="text-xs font-black uppercase tracking-widest">{profile.full_name}</h2>
                    <p className="text-[8px] text-nova-cyan font-black uppercase tracking-[0.2em]">{profile.professional_title || 'Innovation Architect'}</p>
                 </div>
              </div>
              {profile.verification_status === 'approved' && (
                 <div className="px-2 py-0.5 rounded-full bg-nova-cyan/20 border border-nova-cyan/30">
                    <span className="text-[7px] font-black uppercase tracking-widest text-nova-cyan">Verified</span>
                 </div>
              )}
           </div>

           <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                 <p className="text-[7px] font-black uppercase tracking-widest text-white/40 mb-0.5">Node Level</p>
                 <p className="text-[10px] font-black">Level 1 Node</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                 <p className="text-[7px] font-black uppercase tracking-widest text-white/40 mb-0.5">Status</p>
                 <p className="text-[10px] font-black text-nova-green uppercase">Active</p>
              </div>
           </div>
        </section>
      ) : loading && (
        <div className="lg:hidden h-32 w-full animate-pulse bg-white/5 rounded-[2rem]" />
      )}

      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight mb-1">Command Center</h1>
           <p className="text-white/40 text-[8px] lg:text-[10px] uppercase tracking-[0.4em]">Manage innovation assets</p>
        </div>
        <div className="flex gap-3 lg:gap-4">
           <Link href="/surveys/blueprint" className="flex-1 lg:flex-none px-6 py-3.5 rounded-2xl bg-nova-purple text-white text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] transition-all flex items-center justify-center gap-2">
              <Plus size={14} />
              New Survey
           </Link>
        </div>
      </section>

      {/* Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 lg:h-32 rounded-[2rem] lg:rounded-[2.5rem] bg-white/5 animate-pulse border border-white/5" />
          ))
        ) : (
          [
            { label: 'Surveys', value: stats?.total || 0, icon: ClipboardList, color: 'text-nova-cyan', bg: 'bg-nova-cyan/10' },
            { label: 'Active', value: stats?.active || 0, icon: CheckCircle2, color: 'text-nova-green', bg: 'bg-nova-green/10' },
            { label: 'Drafts', value: stats?.draft || 0, icon: FileEdit, color: 'text-nova-orange', bg: 'bg-nova-orange/10' },
            { label: 'Responses', value: stats?.totalResponses || 0, icon: Users, color: 'text-nova-purple', bg: 'bg-nova-purple/10' },
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={stat.label}
              className="p-4 lg:p-6 rounded-[2rem] lg:rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl group hover:border-white/10 transition-all"
            >
               <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl ${stat.bg} flex items-center justify-center border border-white/5`}>
                     <stat.icon size={16} className={stat.color} />
                  </div>
               </div>
               <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-white/40 mb-0.5">{stat.label}</p>
               <h3 className="text-xl lg:text-2xl font-black">{stat.value}</h3>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
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
              <h2 className="text-sm font-black uppercase tracking-widest mb-8">Recent Surveys</h2>
              <div className="space-y-6">
                 {loading ? (
                    [1, 2, 3].map(i => (
                       <div key={i} className="h-12 w-full animate-pulse bg-white/5 rounded-xl" />
                    ))
                 ) : recentSurveys.length > 0 ? (
                    recentSurveys.map((survey, i) => (
                      <Link href={`/creator/surveys`} key={survey.id} className="flex items-center justify-between group cursor-pointer">
                         <div className="min-w-0 flex-1 mr-4">
                            <h4 className="text-[11px] font-bold text-white group-hover:text-nova-cyan transition-colors truncate">{survey.title}</h4>
                            <p className="text-[8px] text-white/30 uppercase tracking-widest">{survey.category || 'General'}</p>
                         </div>
                         <span className={`text-[8px] font-black uppercase tracking-widest ${
                            survey.status === 'published' ? 'text-nova-green' :
                            survey.status === 'draft' ? 'text-nova-orange' : 'text-white/40'
                         }`}>
                            {survey.status}
                         </span>
                      </Link>
                    ))
                 ) : (
                    <div className="text-center py-10">
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No recent surveys</p>
                    </div>
                 )}
              </div>
              <Link href="/creator/surveys" className="block w-full mt-10 py-4 rounded-2xl border border-white/5 bg-white/2 text-[9px] font-black uppercase tracking-widest text-center hover:bg-white/5 transition-all">
                 View All Surveys
              </Link>
           </div>
        </section>
      </div>

      {/* Quick Launch Grid */}
      <section>
         <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-8 ml-2">Quick Launch</h2>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'View Drafts', icon: FileEdit, href: '/creator/surveys?status=draft' },
              { name: 'Active Surveys', icon: CheckCircle2, href: '/creator/surveys?status=published' },
              { name: 'Analytics', icon: TrendingUp, href: '/creator/analytics' },
              { name: 'Profile Settings', icon: User, href: '/creator/settings' },
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
