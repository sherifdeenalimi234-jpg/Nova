import React from 'react';
import { Send, Globe, Link, Mail, QrCode } from 'lucide-react';

export default function CollectPlaceholder() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header>
         <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Collect Module</h2>
         <p className="text-white/40 text-xs uppercase tracking-widest font-medium">Manage distribution and response streams</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Public Link', icon: Link, status: 'Active' },
           { label: 'Email Invite', icon: Mail, status: 'Ready' },
           { label: 'QR Code', icon: QrCode, status: 'Ready' },
           { label: 'Web Embed', icon: Globe, status: 'Locked' },
         ].map((item, idx) => (
           <div key={idx} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                 <item.icon size={24} />
              </div>
              <div>
                 <h3 className="text-sm font-bold mb-1">{item.label}</h3>
                 <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                   item.status === 'Active' ? 'bg-nova-green/10 border-nova-green text-nova-green' : 'bg-white/5 border-white/10 text-white/20'
                 }`}>
                   {item.status.toUpperCase()}
                 </span>
              </div>
           </div>
         ))}
      </div>

      <div className="p-12 rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01] text-center">
         <Send size={48} className="mx-auto text-white/10 mb-6" />
         <h3 className="text-xl font-black uppercase tracking-tight mb-2">Distribution Hub Initializing</h3>
         <p className="text-white/30 text-xs uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
           Connect your research node to global data streams in the next deployment.
         </p>
      </div>
    </div>
  );
}
