"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Save, Loader2, Globe, Info, Camera, Zap, ChevronRight } from 'lucide-react';
import { uploadFile } from '@/lib/supabase/storage';
import CreatorUpgradeModal from '@/components/feed/CreatorUpgradeModal';

export default function ProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfile(data);
          setFullName(data.full_name || '');
          setBio(data.bio || '');
          setUsername(data.custom_url || '');
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const url = await uploadFile(file, 'avatars');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ avatar_url: url })
          .eq('id', user.id);

        setProfile({ ...profile, avatar_url: url });
        alert("Avatar synchronized.");
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    }
    setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio: bio,
          custom_url: username.toLowerCase().replace(/\s+/g, '-'),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (!error) {
        alert("System profile synchronized successfully.");
      } else {
        alert("Error syncing profile: " + error.message);
      }
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="text-nova-cyan animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-2xl mx-auto pt-20">
        <header className="mb-12">
           <h1 className="text-3xl font-black tracking-widest uppercase text-white mb-2">Profile Configuration</h1>
           <p className="text-white/40 text-[10px] uppercase tracking-widest">Update your innovation identity</p>
        </header>

        <div className="space-y-8">
           {/* Avatar Section */}
           <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/10">
              <div className="relative group">
                 <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-nova-cyan/20 to-nova-purple/20 flex items-center justify-center border border-white/10 overflow-hidden">
                    {profile?.avatar_url ? (
                       <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                       <User size={32} className="text-white/20" />
                    )}
                 </div>
                 <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl cursor-pointer">
                    <Camera size={20} className="text-nova-cyan" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                 </label>
              </div>
              <div>
                 <h3 className="text-sm font-bold mb-1 uppercase tracking-wider">Profile Visual</h3>
                 <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest">JPG, PNG or WEBP. Max 2MB.</p>
              </div>
           </div>

           {/* Form Fields */}
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-nova-cyan flex items-center gap-2">
                    <User size={12} /> Full Name
                 </label>
                 <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-nova-cyan/50 focus:outline-none text-sm transition-all"
                    placeholder="Enter your professional name"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-nova-purple flex items-center gap-2">
                    <Globe size={12} /> Custom Ecosystem URL
                 </label>
                 <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm">nova.community/u/</span>
                    <input
                       type="text"
                       value={username}
                       onChange={(e) => setUsername(e.target.value)}
                       className="w-full pl-36 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-nova-purple/50 focus:outline-none text-sm transition-all"
                       placeholder="username"
                    />
                 </div>
                 <p className="text-[9px] text-white/30 uppercase tracking-widest px-1">This will be your unique identifier in the ecosystem.</p>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-nova-green flex items-center gap-2">
                    <Info size={12} /> Biography
                 </label>
                 <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-nova-green/50 focus:outline-none text-sm transition-all resize-none"
                    placeholder="Briefly describe your innovation focus..."
                 />
              </div>
           </div>

           <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-nova-cyan/20 to-nova-purple/20 border border-nova-cyan/30 hover:border-nova-cyan/60 transition-all flex items-center justify-center gap-3 group active:scale-95 disabled:opacity-50"
           >
              {saving ? (
                 <Loader2 size={18} className="animate-spin text-nova-cyan" />
              ) : (
                 <Save size={18} className="text-nova-cyan group-hover:scale-110 transition-transform" />
              )}
              <span className="text-xs font-black uppercase tracking-[0.3em] text-white">Synchronize Node</span>
           </button>

           {/* Creator Access Section */}
           {!profile?.is_verified_creator && (
              <div className="mt-12 pt-12 border-t border-white/5">
                 <div className="mb-6">
                    <h2 className="text-lg font-black tracking-widest uppercase flex items-center gap-3">
                       <Zap className="text-nova-purple" size={20} />
                       Activate Creator Access
                    </h2>
                    <p className="text-white/40 text-xs mt-2 leading-relaxed">
                       Unlock professional tools: research uploads, innovation showcase, analytics, and direct collaboration.
                    </p>
                 </div>

                 {profile?.creator_status === 'pending' ? (
                    <div className="p-8 rounded-3xl bg-nova-cyan/5 border border-nova-cyan/20 text-center">
                       <div className="w-12 h-12 rounded-2xl bg-black border border-nova-cyan/20 flex items-center justify-center mx-auto mb-4">
                          <Loader2 size={24} className="text-nova-cyan animate-spin" />
                       </div>
                       <h3 className="text-sm font-black uppercase tracking-widest mb-1 text-white">Verification Pending</h3>
                       <p className="text-[8px] text-white/40 uppercase tracking-[0.3em]">Protocol active • Awaiting authentication</p>
                    </div>
                 ) : (
                    <button
                       onClick={() => setIsUpgradeModalOpen(true)}
                       className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-nova-cyan transition-all flex items-center justify-center gap-3"
                    >
                       {profile?.creator_status === 'rejected' ? 'Re-apply for Access' : 'Begin Application'}
                       <ChevronRight size={14} />
                    </button>
                 )}
              </div>
           )}
        </div>
      </div>

      <CreatorUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        user={profile}
      />
    </div>
  );
}
