import React from 'react';
import { BarChart3, TrendingUp, Users, PieChart } from 'lucide-react';

export default function AnalyticsPlaceholder() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Analytics Hub</h2>
            <p className="text-white/40 text-xs uppercase tracking-widest font-medium">Real-time intelligence and node metrics</p>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-nova-green animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-nova-green">Live Stream Active</span>
         </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Total Responses', value: '0', icon: Users, color: 'text-nova-cyan' },
           { label: 'Completion Rate', value: '0%', icon: TrendingUp, color: 'text-nova-purple' },
           { label: 'Avg. Duration', value: '0m', icon: BarChart3, color: 'text-nova-green' },
         ].map((stat, idx) => {
           if (!stat) return null;
           return (
             <div key={idx} className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                <stat.icon size={64} className={`absolute -right-4 -bottom-4 opacity-5 ${stat.color || 'text-white'} group-hover:scale-110 transition-transform`} />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">{stat.label}</p>
                <div className="text-4xl font-black">{stat.value}</div>
             </div>
           );
         })}
      </div>

      <div className="p-20 rounded-[3rem] bg-gradient-to-br from-white/[0.02] to-transparent border border-white/5 flex flex-col items-center text-center">
         <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-white/20 mb-8">
            <PieChart size={40} />
         </div>
         <h3 className="text-2xl font-black uppercase tracking-tight mb-4">No Intelligence Data Found</h3>
         <p className="text-white/40 text-sm max-w-sm leading-relaxed uppercase tracking-widest">
           Once responses begin streaming into this research node, real-time visualizations and AI insights will populate here.
         </p>
      </div>
    </div>
  );
}
