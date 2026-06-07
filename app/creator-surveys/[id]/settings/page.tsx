import React from 'react';
import { Settings, Lock, Trash2, ShieldAlert, Globe, Bell } from 'lucide-react';

export default function SettingsPlaceholder() {
  return (
    <div className="min-h-[60vh] space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header>
         <h2 className="text-3xl font-black uppercase tracking-tight mb-2 text-white">Workspace Settings</h2>
         <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Node configuration and security protocols</p>
      </header>

      <div className="max-w-3xl space-y-8">
         {/* General Settings */}
         <section className="p-8 lg:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8">
            <div className="flex items-center gap-3">
               <Settings size={18} className="text-nova-cyan" />
               <h3 className="text-xs font-black uppercase tracking-widest">General Configuration</h3>
            </div>

            <div className="space-y-6">
               <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Survey Title</label>
                  <input
                    disabled
                    placeholder="Loading..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold opacity-50"
                  />
               </div>
               <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Research Category</label>
                  <select disabled className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold opacity-50 appearance-none">
                     <option>Loading...</option>
                  </select>
               </div>
            </div>
         </section>

         {/* Access & Visibility */}
         <section className="p-8 lg:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8">
            <div className="flex items-center gap-3">
               <Lock size={18} className="text-nova-purple" />
               <h3 className="text-xs font-black uppercase tracking-widest">Access & Visibility</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                  { label: 'Public Access', icon: Globe, enabled: false },
                  { label: 'Password Protection', icon: ShieldAlert, enabled: false },
                  { label: 'Team Only', icon: Lock, enabled: true },
                  { label: 'Notifications', icon: Bell, enabled: true },
               ].map((opt, idx) => (
                  <div key={idx} className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-between opacity-50">
                     <div className="flex items-center gap-4">
                        <opt.icon size={18} className="text-white/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                     </div>
                     <div className={`w-10 h-5 rounded-full p-1 ${opt.enabled ? 'bg-nova-purple/20' : 'bg-white/5'}`}>
                        <div className={`w-3 h-3 rounded-full ${opt.enabled ? 'bg-nova-purple ml-auto' : 'bg-white/10'}`} />
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* Danger Zone */}
         <section className="p-8 lg:p-10 rounded-[2.5rem] bg-red-500/[0.02] border border-red-500/10 space-y-8">
            <div className="flex items-center gap-3 text-red-500">
               <Trash2 size={18} />
               <h3 className="text-xs font-black uppercase tracking-widest">Danger Zone</h3>
            </div>

            <div className="p-6 rounded-3xl bg-red-500/[0.05] border border-red-500/10 space-y-4">
               <p className="text-[10px] text-red-500/60 uppercase font-black tracking-tight leading-relaxed">
                  Deleting this survey node will permanently erase all questions, logic paths, and collected data points. This action cannot be undone.
               </p>
               <button className="px-8 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">
                  Terminate Node
               </button>
            </div>
         </section>
      </div>
    </div>
  );
}
