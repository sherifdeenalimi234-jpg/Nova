import React from 'react';
import { Sparkles, Brain, Cpu, MessageSquare, Search } from 'lucide-react';

export default function AILabPlaceholder() {
  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="text-center space-y-4 max-w-2xl mx-auto">
         <div className="w-16 h-16 rounded-2xl bg-nova-purple/20 border border-nova-purple/30 flex items-center justify-center text-nova-purple mx-auto animate-pulse">
            <Sparkles size={32} />
         </div>
         <h2 className="text-4xl font-black uppercase tracking-tight">AI Research Lab</h2>
         <p className="text-white/40 text-sm leading-relaxed uppercase tracking-widest font-medium">
           Leverage advanced intelligence nodes to enhance research quality and automate discovery.
         </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {[
           { title: 'Question Assistant', desc: 'Generate high-fidelity research questions based on objectives.', icon: MessageSquare, status: 'READY' },
           { title: 'Research Assistant', desc: 'Analyze target audience and suggest optimal survey modes.', icon: Brain, status: 'BETA' },
           { title: 'Analysis Bot', desc: 'Automatically extract patterns and anomalies from response data.', icon: Cpu, status: 'LOCKED' },
           { title: 'Synthesis Engine', desc: 'Generate comprehensive reports from multiple research nodes.', icon: Search, status: 'LOCKED' },
         ].map((tool, idx) => (
           <button key={idx} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex gap-6 text-left hover:bg-white/[0.04] transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-nova-purple transition-colors shrink-0">
                 <tool.icon size={28} />
              </div>
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                    <h3 className="font-bold">{tool.title}</h3>
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full border border-white/10 text-white/20">{tool.status}</span>
                 </div>
                 <p className="text-[10px] text-white/30 uppercase tracking-widest leading-relaxed">{tool.desc}</p>
              </div>
           </button>
         ))}
      </div>
    </div>
  );
}
