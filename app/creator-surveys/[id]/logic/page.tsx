import React from 'react';
import { GitBranch, Settings2, Share2 } from 'lucide-react';

export default function LogicPlaceholder() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="w-24 h-24 rounded-[2.5rem] bg-nova-purple/10 border border-nova-purple/20 flex items-center justify-center text-nova-purple group">
         <GitBranch size={40} className="group-hover:rotate-90 transition-transform duration-500" />
      </div>

      <div className="max-w-md space-y-4">
        <h2 className="text-3xl font-black uppercase tracking-tight">Logic Engine Shell</h2>
        <p className="text-white/40 text-sm leading-relaxed uppercase tracking-widest">
          The Intelligence Flow Manager is being calibrated. Establish advanced branching and conditional nodes in the next phase.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
           <Settings2 size={16} className="text-nova-purple mx-auto" />
           <span className="block text-[8px] font-black uppercase tracking-widest text-white/20">Conditional Matrix</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
           <Share2 size={16} className="text-nova-purple mx-auto" />
           <span className="block text-[8px] font-black uppercase tracking-widest text-white/20">Flow Mapping</span>
        </div>
      </div>
    </div>
  );
}
