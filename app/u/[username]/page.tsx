import React from 'react';
import { notFound } from 'next/navigation';
import { getProfileByUsername } from '@/lib/supabase/profiles';
import {
  User, Shield, Briefcase, FileText, Share2, Award, Zap,
  Linkedin, Github, Twitter, Globe, Youtube, Instagram,
  Facebook, Mail, MapPin, ExternalLink, Code, Database,
  GraduationCap
} from 'lucide-react';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

const socialIcons: Record<string, any> = {
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  x: Twitter,
  portfolio: Globe,
  website: Globe,
  youtube: Youtube,
  instagram: Instagram,
  facebook: Facebook,
  researchgate: GraduationCap,
  google_scholar: GraduationCap,
  tiktok: Code, // Fallback
};

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const { data: profile, error } = await getProfileByUsername(username);

  if (error || !profile) {
    notFound();
  }

  const isCreator = profile.is_verified_creator;
  const creatorData = profile.creator_profiles;
  const socialLinks = creatorData?.social_links || {};

  return (
    <div className="min-h-screen bg-black text-white selection:bg-nova-cyan/30 overflow-x-hidden">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b] via-[#050505] to-black" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50vh] bg-nova-cyan/5 blur-[120px] rounded-full opacity-50" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Banner */}
      <div className="relative h-[35vh] w-full overflow-hidden">
        {profile.banner_url ? (
          <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-nova-cyan/10 via-nova-purple/10 to-nova-cyan/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 -mt-24 pb-20">
        {/* Profile Header */}
        <header className="flex flex-col items-center md:items-start md:flex-row gap-8 mb-16">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-nova-cyan to-nova-purple blur-2xl opacity-20" />
            <div className="relative w-44 h-44 rounded-[2.5rem] border border-white/10 p-1.5 bg-black/50 backdrop-blur-3xl overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover rounded-[2rem]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-[2rem]">
                  <User size={64} className="text-white/10" />
                </div>
              )}
            </div>
            {isCreator && (
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-nova-cyan flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.4)] border-2 border-black">
                <Shield size={20} className="text-black" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left pt-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
              <h1 className="text-4xl font-black tracking-tight uppercase text-white">
                {profile.full_name}
              </h1>
              {profile.professional_title && (
                <span className="text-nova-cyan text-[10px] font-mono tracking-[0.4em] uppercase mb-1.5 pb-1 border-b border-nova-cyan/30">
                  {profile.professional_title}
                </span>
              )}
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
              {profile.location && (
                <div className="flex items-center gap-1.5 text-white/40 text-[10px] uppercase tracking-widest font-bold">
                  <MapPin size={12} className="text-nova-cyan" />
                  {profile.location}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-white/40 text-[10px] uppercase tracking-widest font-bold">
                <Code size={12} className="text-nova-purple" />
                {isCreator ? 'Verified Node' : 'Community Node'}
              </div>
            </div>

            <p className="max-w-xl text-white/60 text-sm leading-relaxed mb-8">
              {profile.bio || "System biography not initialized."}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button className="px-8 py-3 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-nova-cyan hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all duration-500">
                Contact Node
              </button>
              <button className="px-8 py-3 rounded-2xl border border-white/10 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                Appreciate
              </button>
              <button className="p-3 rounded-2xl border border-white/10 bg-white/5 text-white/60 hover:text-white transition-all">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Professional Links Grid */}
        {Object.keys(socialLinks).length > 0 && (
          <section className="mb-20">
            <h2 className="text-[10px] font-black tracking-[0.5em] uppercase text-white/30 mb-8 ml-2">Digital Presence</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {Object.entries(socialLinks).map(([key, url]: [string, any]) => {
                const Icon = socialIcons[key.toLowerCase()] || Globe;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative p-4 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl flex flex-col items-center justify-center gap-3 transition-all duration-500 hover:border-nova-cyan/30 hover:bg-nova-cyan/[0.05]"
                  >
                    <div className="absolute inset-0 bg-nova-cyan/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Icon size={24} className="text-white/40 group-hover:text-nova-cyan transition-colors" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/60 transition-colors">{key}</span>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Long Bio / About */}
        {creatorData?.long_bio && (
          <section className="mb-20 max-w-2xl">
            <h2 className="text-[10px] font-black tracking-[0.5em] uppercase text-white/30 mb-6 ml-2">Node Dossier</h2>
            <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
              <p className="text-white/50 text-sm leading-relaxed whitespace-pre-wrap">
                {creatorData.long_bio}
              </p>
            </div>
          </section>
        )}

        {/* Creator Sections */}
        {isCreator && (
          <div className="space-y-20">
            {/* Innovation Showcase */}
            <section>
              <div className="flex items-center justify-between mb-10 px-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-nova-cyan/10 flex items-center justify-center border border-nova-cyan/20">
                    <Briefcase size={18} className="text-nova-cyan" />
                  </div>
                  <h2 className="text-xl font-black tracking-widest uppercase">Innovation Showcase</h2>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Active Projects</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {profile.projects && profile.projects.length > 0 ? (
                  profile.projects.map((project: any) => (
                    <div key={project.id} className="group relative rounded-[2.5rem] border border-white/10 bg-white/[0.02] overflow-hidden hover:border-nova-cyan/30 transition-all duration-700">
                      <div className="aspect-video w-full bg-white/5 relative overflow-hidden">
                        {project.thumbnail_url ? (
                          <img src={project.thumbnail_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center italic text-white/10 text-xs">
                            No visual log
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      </div>
                      <div className="p-8">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-3 py-1 rounded-full bg-nova-cyan/10 border border-nova-cyan/20 text-[8px] font-black text-nova-cyan uppercase tracking-widest">
                            {project.status || 'Active'}
                          </span>
                        </div>
                        <h3 className="text-lg font-black mb-3 group-hover:text-nova-cyan transition-colors">{project.title}</h3>
                        <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{project.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-20 rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                      <Database size={24} className="text-white/10" />
                    </div>
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">Showcase Empty</p>
                  </div>
                )}
              </div>
            </section>

            {/* Research & Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {/* Research Section */}
               <section>
                 <div className="flex items-center gap-3 mb-8 ml-2">
                    <FileText size={18} className="text-nova-purple" />
                    <h2 className="text-sm font-black tracking-widest uppercase">Research Log</h2>
                 </div>
                 <div className="space-y-4">
                    {/* Sample research card */}
                    <div className="p-6 rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.05] transition-all cursor-pointer flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-nova-purple/10 flex items-center justify-center border border-nova-purple/20">
                             <FileText size={16} className="text-nova-purple" />
                          </div>
                          <div>
                             <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Theoretical Innovation Framework</h4>
                             <p className="text-[8px] text-white/30 uppercase tracking-widest">Research Paper • Oct 2024</p>
                          </div>
                       </div>
                       <ExternalLink size={14} className="text-white/20 group-hover:text-nova-purple transition-all" />
                    </div>
                 </div>
               </section>

               {/* Achievements Section */}
               <section>
                 <div className="flex items-center gap-3 mb-8 ml-2">
                    <Award size={18} className="text-nova-green" />
                    <h2 className="text-sm font-black tracking-widest uppercase">Achievements</h2>
                 </div>
                 <div className="flex flex-wrap gap-4">
                    <div className="px-6 py-4 rounded-[2rem] bg-nova-green/5 border border-nova-green/10 flex items-center gap-3 group hover:border-nova-green/30 transition-all">
                       <div className="w-10 h-10 rounded-2xl bg-nova-green/10 flex items-center justify-center border border-nova-green/20">
                          <Award size={18} className="text-nova-green" />
                       </div>
                       <div>
                          <span className="block text-[10px] font-black text-white uppercase tracking-widest">Founding Creator</span>
                          <span className="block text-[8px] text-nova-green/60 uppercase tracking-widest">NOVA Node #001</span>
                       </div>
                    </div>
                 </div>
               </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
