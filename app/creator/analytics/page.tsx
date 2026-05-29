"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Users,
  Eye,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Zap,
  Activity
} from 'lucide-react';

const visitData = [
  { name: 'Mon', views: 2400, engagement: 400 },
  { name: 'Tue', views: 1398, engagement: 300 },
  { name: 'Wed', views: 9800, engagement: 2000 },
  { name: 'Thu', views: 3908, engagement: 800 },
  { name: 'Fri', views: 4800, engagement: 1200 },
  { name: 'Sat', views: 3800, engagement: 1100 },
  { name: 'Sun', views: 4300, engagement: 1400 },
];

const categoryData = [
  { name: 'Research', value: 400 },
  { name: 'Projects', value: 300 },
  { name: 'Surveys', value: 300 },
  { name: 'Innovations', value: 200 },
];

const COLORS = ['#00f2ff', '#7000ff', '#00ffaa', '#ffaa00'];

export default function CreatorAnalytics() {
  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Ecosystem Intelligence</h1>
           <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Node performance and reach analytics</p>
        </div>
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
           {['7D', '30D', '90D', 'ALL'].map((range) => (
             <button key={range} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${range === '7D' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>
                {range}
             </button>
           ))}
        </div>
      </header>

      {/* High Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Network Views', value: '42.5K', trend: '+12.4%', up: true, icon: Eye, color: 'text-nova-cyan' },
           { label: 'Node Authority', value: '84/100', trend: '+2.1%', up: true, icon: Zap, color: 'text-nova-purple' },
           { label: 'Total Interactions', value: '1,842', trend: '-0.8%', up: false, icon: Activity, color: 'text-nova-green' },
           { label: 'Ecosystem Share', value: '3.2%', trend: '+0.5%', up: true, icon: Globe, color: 'text-nova-orange' },
         ].map((metric, i) => (
           <div key={i} className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                 <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                    <metric.icon size={18} className={metric.color} />
                 </div>
                 <div className={`flex items-center gap-1 text-[10px] font-black ${metric.up ? 'text-nova-green' : 'text-red-500'}`}>
                    {metric.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {metric.trend}
                 </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{metric.label}</p>
              <h3 className="text-3xl font-black">{metric.value}</h3>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Reach Chart */}
         <section className="p-8 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <h2 className="text-sm font-black uppercase tracking-widest mb-10 ml-2">Visibility Dynamics</h2>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={visitData}>
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
                       itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                     />
                     <Line type="monotone" dataKey="views" stroke="#00f2ff" strokeWidth={3} dot={false} />
                     <Line type="monotone" dataKey="engagement" stroke="#7000ff" strokeWidth={3} dot={false} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </section>

         {/* Category Distribution */}
         <section className="p-8 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <h2 className="text-sm font-black uppercase tracking-widest mb-10 ml-2">Intel Distribution</h2>
            <div className="h-80 w-full flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip
                        contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                     />
                  </PieChart>
               </ResponsiveContainer>
               <div className="space-y-4 pr-10">
                  {categoryData.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                       <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{item.name}</span>
                    </div>
                  ))}
               </div>
            </div>
         </section>
      </div>

      {/* Top Performing Content */}
      <section className="p-8 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
         <h2 className="text-sm font-black uppercase tracking-widest mb-8 ml-2">High Impact Intel</h2>
         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className="border-b border-white/5">
                     <th className="text-left py-4 px-4 text-[9px] font-black uppercase tracking-widest text-white/20">Transmission</th>
                     <th className="text-left py-4 px-4 text-[9px] font-black uppercase tracking-widest text-white/20">Reach</th>
                     <th className="text-left py-4 px-4 text-[9px] font-black uppercase tracking-widest text-white/20">Engagement</th>
                     <th className="text-left py-4 px-4 text-[9px] font-black uppercase tracking-widest text-white/20">Impact</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {[
                    { name: 'Neural Grid Protocols', reach: '12.4K', engagement: '1.2K', impact: 'High' },
                    { name: 'Ecosystem Dynamics v1', reach: '8.2K', engagement: '840', impact: 'Medium' },
                    { name: 'Nexus Core Update', reach: '5.1K', engagement: '420', impact: 'Medium' },
                  ].map((item, i) => (
                    <tr key={i} className="group hover:bg-white/[0.02] transition-all">
                       <td className="py-6 px-4">
                          <span className="text-xs font-bold text-white group-hover:text-nova-cyan transition-colors">{item.name}</span>
                       </td>
                       <td className="py-6 px-4 text-[10px] font-black text-white/60">{item.reach}</td>
                       <td className="py-6 px-4 text-[10px] font-black text-white/60">{item.engagement}</td>
                       <td className="py-6 px-4">
                          <span className="px-3 py-1 rounded-lg bg-nova-cyan/10 border border-nova-cyan/20 text-[8px] font-black text-nova-cyan uppercase tracking-widest">
                             {item.impact}
                          </span>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </section>
    </div>
  );
}
