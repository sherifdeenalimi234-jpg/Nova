"use client";

import React, { useState, useEffect } from "react";
import { User, Shield, ArrowRight, Rocket, Briefcase, FileText, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ProfileTab() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full py-20">
      <div className="w-8 h-8 border-2 border-nova-cyan border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
     <div className="p-10 text-center">
        <p className="text-white/40 text-[10px] uppercase tracking-widest">Authentication failed</p>
     </div>
  );

  return (
    <div className="px-6 space-y-8 pb-10">
      {/* Header Card */}
      <section className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-nova-cyan/5 blur-3xl -mr-16 -mt-16 group-hover:bg-nova-cyan/10 transition-all" />

        <div className="flex items-center gap-6 mb-8 relative">
          <div className="w-20 h-20 rounded-3xl border border-white/10 p-1 bg-black/50 overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-2xl">
                <User size={32} className="text-white/10" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">{profile.full_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-nova-cyan text-[9px] font-black uppercase tracking-widest">
                {profile.is_verified_creator ? 'Verified Creator' : 'Community Node'}
              </span>
              {profile.is_verified_creator && <Shield size={12} className="text-nova-cyan" />}
            </div>
          </div>
        </div>

        <p className="text-white/40 text-xs leading-relaxed mb-8">
           {profile.bio || "No biography established for this node yet."}
        </p>

        <div className="grid grid-cols-2 gap-4">
           <Link href="/settings/profile" className="flex items-center justify-center py-3 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              Edit Node
           </Link>
           <Link href={`/u/${profile.custom_url || profile.id}`} className="flex items-center justify-center py-3 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              Public View
           </Link>
        </div>
      </section>

      {/* Creator Studio Access Section */}
      <section className="space-y-4">
         <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 ml-4">Ecosystem Production</h3>

         {profile.is_verified_creator ? (
            <Link href="/creator" className="block group">
               <div className="p-8 rounded-[2.5rem] border border-nova-cyan/20 bg-nova-cyan/5 backdrop-blur-xl relative overflow-hidden group-hover:border-nova-cyan/40 transition-all">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-nova-cyan/10 blur-[60px] -mr-20 -mt-20 group-hover:bg-nova-cyan/20 transition-all" />

                  <div className="flex items-center justify-between relative">
                     <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-black border border-nova-cyan/20 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(0,242,255,0.2)] transition-all">
                           <LayoutDashboard size={24} className="text-nova-cyan" />
                        </div>
                        <div>
                           <h4 className="text-lg font-black uppercase tracking-tight text-white mb-1">Open Creator Studio</h4>
                           <p className="text-nova-cyan/60 text-[8px] font-black uppercase tracking-[0.2em]">Access Command Center</p>
                        </div>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-nova-cyan group-hover:text-black transition-all">
                        <ArrowRight size={18} />
                     </div>
                  </div>
               </div>
            </Link>
         ) : (
            <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden">
               <div className="flex items-center gap-5 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                     <Rocket size={24} className="text-white/20" />
                  </div>
                  <div>
                     <h4 className="text-lg font-black uppercase tracking-tight text-white/60 mb-1">Activate Creator Access</h4>
                     <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.2em]">Upgrade your node status</p>
                  </div>
               </div>
               <p className="text-white/30 text-xs leading-relaxed mb-8">
                  Unlock professional portfolio tools, research logs, survey systems, and ecosystem-wide visibility.
               </p>
               <button className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-nova-cyan transition-all">
                  Begin Application
               </button>
            </div>
         )}
      </section>

      {/* Content Stats */}
      <div className="grid grid-cols-3 gap-4">
         {[
           { label: 'Intel', icon: FileText, value: '0' },
           { label: 'Nodes', icon: Briefcase, value: '0' },
           { label: 'Network', icon: User, value: '1' },
         ].map((stat, i) => (
           <div key={i} className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] text-center">
              <stat.icon size={16} className="mx-auto mb-3 text-white/20" />
              <div className="text-lg font-black mb-1">{stat.value}</div>
              <p className="text-[8px] font-black uppercase tracking-widest text-white/20">{stat.label}</p>
           </div>
         ))}
      </div>
    </div>
  );
}
