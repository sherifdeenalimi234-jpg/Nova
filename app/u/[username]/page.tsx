import React from 'react';
import { notFound } from 'next/navigation';
import { getProfileByUsername } from '@/lib/supabase/profiles';
import { User, Shield, Briefcase, FileText, Share2, Award, Zap } from 'lucide-react';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const { data: profile, error } = await getProfileByUsername(username);

  if (error || !profile) {
    notFound();
  }

  const isCreator = profile.is_verified_creator;
  const creatorData = profile.creator_profiles;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-nova-cyan/30">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b] via-[#050505] to-black" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50vh] bg-nova-cyan/5 blur-[120px] rounded-full opacity-50" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-20">
        {/* Profile Header */}
        <header className="flex flex-col items-center text-center mb-16">
          <div className="relative group mb-6">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-nova-cyan to-nova-purple blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-32 h-32 rounded-3xl border border-white/10 p-1 bg-black/50 backdrop-blur-xl overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-2xl">
                  <User size={48} className="text-white/20" />
                </div>
              )}
            </div>
            {isCreator && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-nova-cyan flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.5)] border-2 border-black">
                <Shield size={16} className="text-black" />
              </div>
            )}
          </div>

          <h1 className="text-3xl font-black tracking-widest uppercase text-white mb-2">
            {profile.full_name}
          </h1>
          <p className="text-nova-cyan/60 text-[10px] font-mono tracking-[0.3em] uppercase mb-4">
             {isCreator ? 'Verified Creator Node' : 'Community Member Node'}
          </p>
          <p className="max-w-md text-white/50 text-sm leading-relaxed mb-8">
            {profile.bio || "No biography established for this node yet."}
          </p>

          <div className="flex gap-4">
            <button className="px-6 py-2 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-nova-cyan transition-colors">
              Appreciate
            </button>
            <button className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white transition-all">
              <Share2 size={18} />
            </button>
          </div>
        </header>

        {/* Creator Sections */}
        {isCreator ? (
          <div className="space-y-12">
            {/* Innovation Showcase */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <Briefcase size={20} className="text-nova-cyan" />
                <h2 className="text-lg font-black tracking-widest uppercase">Innovation Showcase</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {creatorData?.innovation_showcase ? (
                  /* Map through real data later */
                  <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl group hover:border-nova-cyan/30 transition-all cursor-pointer">
                     <div className="w-full h-40 rounded-2xl bg-white/5 mb-4 border border-white/5 overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-nova-cyan/10 to-nova-purple/10 flex items-center justify-center italic text-white/10 text-xs">
                           Project Media Placeholder
                        </div>
                     </div>
                     <h3 className="text-sm font-bold mb-2 group-hover:text-nova-cyan transition-colors">Project Identity Alpha</h3>
                     <p className="text-xs text-white/40 leading-relaxed">Developing the next generation of decentralized innovation protocols.</p>
                  </div>
                ) : (
                  <div className="col-span-full p-10 rounded-3xl border border-dashed border-white/5 text-center">
                    <p className="text-white/20 text-xs uppercase tracking-widest">No showcase items initialized</p>
                  </div>
                )}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {/* Research Section */}
               <section>
                 <div className="flex items-center gap-3 mb-8">
                    <FileText size={20} className="text-nova-purple" />
                    <h2 className="text-sm font-black tracking-widest uppercase">Research Log</h2>
                 </div>
                 <div className="space-y-4">
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors cursor-pointer flex items-center justify-between group">
                       <div>
                          <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-1">Ecosystem Dynamics v1</h4>
                          <p className="text-[8px] text-white/30 uppercase tracking-widest">PDF • 1.2 MB</p>
                       </div>
                       <Zap size={14} className="text-nova-purple opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                 </div>
               </section>

               {/* Achievements Section */}
               <section>
                 <div className="flex items-center gap-3 mb-8">
                    <Award size={20} className="text-nova-green" />
                    <h2 className="text-sm font-black tracking-widest uppercase">Achievements</h2>
                 </div>
                 <div className="flex flex-wrap gap-3">
                    <div className="px-4 py-2 rounded-xl bg-nova-green/10 border border-nova-green/20 flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-nova-green animate-pulse" />
                       <span className="text-[8px] font-black text-nova-green uppercase tracking-widest">Founding Creator</span>
                    </div>
                 </div>
               </section>
            </div>
          </div>
        ) : (
          <div className="p-20 rounded-[40px] border border-white/5 bg-white/2 backdrop-blur-sm text-center">
             <User size={40} className="mx-auto mb-6 text-white/10" />
             <h2 className="text-lg font-bold tracking-widest uppercase mb-4">Community Node</h2>
             <p className="text-white/30 text-sm max-w-xs mx-auto leading-relaxed">
               This profile belongs to a community member. Activate Creator Access to unlock professional showcase tools.
             </p>
          </div>
        )}

        {/* Social Links (For all) */}
        <footer className="mt-20 pt-10 border-t border-white/5 flex flex-wrap justify-center gap-8">
           {['LinkedIn', 'GitHub', 'ResearchGate'].map((social) => (
             <a key={social} href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-nova-cyan transition-colors">
               {social}
             </a>
           ))}
        </footer>
      </div>
    </div>
  );
}
