import React from 'react';
import { Construction, BarChart3, PieChart, TrendingUp, Activity } from 'lucide-react';

export default function AnalyticsPlaceholder() {
  return (
    <div className="min-h-[60vh] space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
         <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Analytics Center</h2>
         <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Real-time intelligence and data insights</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {[
            { label: 'Completion Rate', icon: Activity },
            { label: 'Average Time', icon: TrendingUp },
            { label: 'Total Responses', icon: BarChart3 },
            { label: 'Drop-off Rate', icon: PieChart },
         ].map((stat, idx) => (
            <div key={idx} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20">
                  <stat.icon size={20} />
               </div>
               <p className="text-[9px] font-black uppercase tracking-widest text-white/20">{stat.label}</p>
               <p className="text-2xl font-black tracking-tighter">--</p>
            </div>
         ))}
      </div>

      <div className="aspect-[21/9] rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-center p-12">
           <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white/10 mb-6">
              <BarChart3 size={32} />
           </div>
           <h4 className="text-sm font-black uppercase tracking-widest mb-2">Awaiting Data Ingestion</h4>
           <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] max-w-sm">
             The analytics engine will automatically generate insights once responses begin streaming into this node.
           </p>
      </div>

      <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 w-fit">
        <Construction size={16} className="text-nova-cyan animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Analytics Center Module In development</span>
      </div>
    </div>
  );
}
