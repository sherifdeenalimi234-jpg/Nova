import React from 'react';
import { Construction, Send, BarChart3, Globe, Share2 } from 'lucide-react';

export default function CollectPlaceholder() {
  return (
    <div className="min-h-[60vh] space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
         <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Collection Hub</h2>
         <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Manage data acquisition and distribution</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="md:col-span-2 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Distribution Status</h3>
               <span className="px-3 py-1 rounded-full bg-nova-cyan/10 text-nova-cyan text-[8px] font-black">WAITING</span>
            </div>
            <div className="py-20 flex flex-col items-center text-center">
               <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white/10 mb-6">
                  <Globe size={32} />
               </div>
               <p className="text-xs text-white/20 uppercase tracking-widest">No active distribution channels</p>
            </div>
         </div>

         <div className="space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">Quick Stats</h3>
               <div className="space-y-4">
                  <div className="flex justify-between">
                     <span className="text-[9px] text-white/20 uppercase font-black">Responses</span>
                     <span className="text-[9px] font-black">0</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-[9px] text-white/20 uppercase font-black">Live Nodes</span>
                     <span className="text-[9px] font-black">0</span>
                  </div>
               </div>
            </div>
            <button className="w-full p-6 rounded-[2rem] bg-nova-purple flex items-center justify-center gap-3 opacity-50 cursor-not-allowed">
               <Share2 size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest">Distribute Survey</span>
            </button>
         </div>
      </section>

      <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 w-fit">
        <Construction size={16} className="text-nova-cyan animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Collection Module In development</span>
      </div>
    </div>
  );
}
