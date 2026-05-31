"use client";
export const dynamic = "force-dynamic";



import React from 'react';
import { HelpCircle, Mail, MessageSquare, Shield } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 pt-24">
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Help Center</h1>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Protocol assistance and support</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
         <div className="glass p-8 rounded-[2rem] border-white/5 hover:bg-white/[0.03] transition-all">
            <Shield className="text-nova-cyan mb-4" size={24} />
            <h3 className="text-sm font-black uppercase tracking-widest mb-2">Security Protocols</h3>
            <p className="text-xs text-white/40 leading-relaxed">Learn about our end-to-end encryption and decentralized data storage systems.</p>
         </div>

         <div className="glass p-8 rounded-[2rem] border-white/5 hover:bg-white/[0.03] transition-all">
            <MessageSquare className="text-nova-purple mb-4" size={24} />
            <h3 className="text-sm font-black uppercase tracking-widest mb-2">Community Guidelines</h3>
            <p className="text-xs text-white/40 leading-relaxed">Review the standards for professional collaboration and research publishing.</p>
         </div>

         <div className="glass p-8 rounded-[2rem] border-white/5 hover:bg-white/[0.03] transition-all">
            <Mail className="text-nova-green mb-4" size={24} />
            <h3 className="text-sm font-black uppercase tracking-widest mb-2">Direct Channel</h3>
            <p className="text-xs text-white/40 leading-relaxed">Reach out to the core development node for technical assistance.</p>
         </div>

         <div className="glass p-8 rounded-[2rem] border-white/5 hover:bg-white/[0.03] transition-all">
            <HelpCircle className="text-nova-orange mb-4" size={24} />
            <h3 className="text-sm font-black uppercase tracking-widest mb-2">Platform FAQ</h3>
            <p className="text-xs text-white/40 leading-relaxed">Common questions about creator verification and project incubation.</p>
         </div>
      </div>
    </div>
  );
}
