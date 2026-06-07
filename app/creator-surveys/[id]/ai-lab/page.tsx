import React from 'react';
import { Construction, Sparkles, Brain, Cpu, MessageSquare } from 'lucide-react';

export default function AILabPlaceholder() {
  return (
    <div className="min-h-[60vh] space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight mb-2">AI Survey Lab</h2>
            <p className="text-white/40 text-[10px] lg:text-xs uppercase tracking-[0.4em]">Neural research and analysis assistants</p>
         </div>
         <div className="px-5 py-2 rounded-full bg-nova-purple/20 border border-nova-purple/30 text-nova-purple text-[8px] font-black uppercase tracking-[0.2em] w-fit">
            Experimental Node
         </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {[
            { title: 'Research Assistant', desc: 'AI-powered survey structure optimization', icon: Brain },
            { title: 'Question Assistant', desc: 'Neural generation of high-quality questions', icon: MessageSquare },
            { title: 'Analysis Assistant', desc: 'Advanced pattern recognition and reporting', icon: Cpu },
         ].map((tool, idx) => (
            <div key={idx} className="p-10 rounded-[3rem] bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 space-y-6 group hover:border-nova-purple/50 transition-all">
               <div className="w-14 h-14 rounded-2xl bg-nova-purple/10 flex items-center justify-center text-nova-purple group-hover:scale-110 transition-transform">
                  <tool.icon size={28} />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest">{tool.title}</h3>
                  <p className="text-[10px] text-white/40 leading-relaxed uppercase">{tool.desc}</p>
               </div>
               <button className="w-full py-4 rounded-2xl bg-white/5 text-[9px] font-black uppercase tracking-widest opacity-50 cursor-not-allowed border border-white/5">
                  Initialize Assistant
               </button>
            </div>
         ))}
      </div>

      <div className="p-10 rounded-[3rem] bg-nova-purple/5 border border-nova-purple/20 flex items-center gap-6">
        <Sparkles size={24} className="text-nova-purple animate-pulse shrink-0" />
        <p className="text-[10px] lg:text-xs text-nova-purple/80 font-medium uppercase tracking-tight leading-relaxed">
          The AI Lab is currently in private beta. We are training neural models specifically for high-integrity research data collection and analysis.
        </p>
      </div>
    </div>
  );
}
