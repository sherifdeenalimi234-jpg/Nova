"use client";
export const dynamic = "force-dynamic";



import React from 'react';
import { BarChart3, Info, Lock } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 pt-24">
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Analytics</h1>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Ecosystem data visualization</p>
      </header>

      <div className="h-[50vh] flex flex-col items-center justify-center glass rounded-[3rem] border-white/5 bg-nova-orange/[0.02]">
         <div className="w-20 h-20 rounded-full bg-nova-orange/10 flex items-center justify-center mb-8 border border-nova-orange/20">
            <Lock className="text-nova-orange" size={32} />
         </div>
         <h2 className="text-xl font-bold uppercase tracking-widest mb-2">Restricted Module</h2>
         <p className="text-white/40 text-xs text-center max-w-xs leading-relaxed">
           Deep analytics and innovation trends visualization requires Level 2 clearance. Continue contributing to the ecosystem to unlock.
         </p>

         <div className="mt-12 flex items-center gap-3 text-[10px] text-nova-orange font-black uppercase tracking-widest">
            <Info size={14} /> Initializing Phase 6 Intelligence
         </div>
      </div>
    </div>
  );
}
