import React from 'react';
import { Settings, Shield, Trash2, Bell, Lock, Database } from 'lucide-react';

export default function SettingsPlaceholder() {
  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in duration-700">
      <header>
         <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Workspace Settings</h2>
         <p className="text-white/40 text-xs uppercase tracking-widest font-medium">Node configuration and security protocols</p>
      </header>

      <div className="space-y-8">
         {/* General Settings */}
         <section className="p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/5 space-y-8">
            <div className="flex items-center gap-4 text-white/40">
               <Settings size={20} />
               <h3 className="text-xs font-black uppercase tracking-widest">General Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Survey Name</label>
                  <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-nova-purple/50 outline-none" placeholder="Survey Title" />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Survey Mode</label>
                  <select className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm appearance-none focus:border-nova-purple/50 outline-none">
                     <option>Standard Survey</option>
                     <option>Conversational Survey</option>
                  </select>
               </div>
            </div>
         </section>

         {/* Access & Security */}
         <section className="p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/5 space-y-8">
            <div className="flex items-center gap-4 text-white/40">
               <Shield size={20} />
               <h3 className="text-xs font-black uppercase tracking-widest">Security Protocols</h3>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-4">
                     <Lock size={20} className="text-white/20" />
                     <div>
                        <p className="text-xs font-bold mb-1">Private Access</p>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest">Only authorized members can access this node</p>
                     </div>
                  </div>
                  <div className="w-12 h-6 bg-nova-purple rounded-full relative">
                     <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
               </div>

               <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-4">
                     <Database size={20} className="text-white/20" />
                     <div>
                        <p className="text-xs font-bold mb-1">Encrypted Responses</p>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest">All incoming data is encrypted at rest</p>
                     </div>
                  </div>
                  <div className="text-[8px] font-black text-nova-green border border-nova-green/30 px-3 py-1 rounded-full">ENABLED</div>
               </div>
            </div>
         </section>

         {/* Danger Zone */}
         <section className="p-10 rounded-[2.5rem] bg-red-500/[0.02] border border-red-500/10 space-y-8">
            <div className="flex items-center gap-4 text-red-500/40">
               <Trash2 size={20} />
               <h3 className="text-xs font-black uppercase tracking-widest">Danger Zone</h3>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
               <div>
                  <p className="text-xs font-bold mb-1">Delete Research Node</p>
                  <p className="text-[9px] text-white/20 uppercase tracking-widest">Permanently remove this survey and all associated data</p>
               </div>
               <button className="px-8 py-4 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                  Terminate Node
               </button>
            </div>
         </section>
      </div>
    </div>
  );
}
