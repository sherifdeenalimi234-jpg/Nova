import React from 'react';
import { Construction, GitBranch } from 'lucide-react';

export default function LogicPlaceholder() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-24 h-24 rounded-[2.5rem] bg-nova-purple/10 flex items-center justify-center text-nova-purple border border-nova-purple/20">
        <GitBranch size={48} />
      </div>

      <div className="space-y-4 max-w-md">
        <h2 className="text-3xl font-black uppercase tracking-tight">Logic Engine</h2>
        <p className="text-white/40 text-xs uppercase tracking-[0.3em] leading-relaxed">
          The Logic Engine will provide advanced branching, conditions, and research flow automation.
        </p>
      </div>

      <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
        <Construction size={16} className="text-nova-purple animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Node System Placeholder</span>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-lg pt-12">
        {['Visual Branching', 'Variables', 'Custom Triggers', 'API Webhooks'].map((feat, idx) => (
          <div key={idx} className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] text-[9px] font-black uppercase tracking-widest text-white/20">
             ✓ {feat}
          </div>
        ))}
      </div>
    </div>
  );
}
