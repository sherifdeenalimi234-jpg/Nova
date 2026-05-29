"use client";

import React, { useState, useEffect } from 'react';
import { updateProfile } from '@/lib/actions/profile';
import { createClient } from '@/lib/supabase/client';
import {
  User,
  Shield,
  Eye,
  Lock,
  Globe,
  Bell,
  Check,
  Trash2,
  Mail,
  Phone,
  Link as LinkIcon
} from 'lucide-react';

export default function CreatorSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [collaboration, setCollaboration] = useState(true);
  const [contactVisibility, setContactVisibility] = useState({
     email: true,
     phone: false,
     socials: true
  });

  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: creator } = await supabase.from('creator_profiles').select('*').eq('id', user.id).single();

      if (profile) {
        setFullName(profile.full_name || '');
      }
      if (creator) {
        setBio(creator.long_bio || '');
        setCollaboration(creator.is_available_for_collaboration ?? true);
        if (creator.contact_visibility) {
          setContactVisibility(creator.contact_visibility);
        }
      }
    }
    loadProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setLoading(true);
    await updateProfile({
      full_name: fullName,
      long_bio: bio
    });
    setLoading(false);
  };

  const handleUpdateVisibility = async (newCollab: boolean, newContact: any) => {
    await updateProfile({
      is_available_for_collaboration: newCollab,
      contact_visibility: newContact
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <header>
         <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Node Configuration</h1>
         <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Manage your professional presence and visibility</p>
      </header>

      <div className="flex gap-4 border-b border-white/5 pb-4">
         {['profile', 'visibility', 'security', 'notifications'].map((tab) => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-white text-black' : 'text-white/40 hover:text-white'
             }`}
           >
              {tab}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-8">
            {activeTab === 'profile' && (
               <section className="p-8 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-8">
                  <div className="flex items-center gap-6">
                     <div className="relative group">
                        <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                           <User size={32} className="text-white/20" />
                        </div>
                        <button className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-[8px] font-black uppercase tracking-widest">Change</span>
                        </button>
                     </div>
                     <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Display Identity</label>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-nova-cyan/30"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Professional Abstract (Bio)</label>
                     <textarea
                       rows={4}
                       value={bio}
                       onChange={(e) => setBio(e.target.value)}
                       className="w-full bg-black/40 border border-white/5 rounded-[2rem] px-6 py-6 text-sm focus:outline-none focus:border-nova-cyan/30 resize-none"
                     />
                  </div>

                  <div className="pt-6 border-t border-white/5 flex justify-end">
                     <button
                       onClick={handleUpdateProfile}
                       disabled={loading}
                       className="px-8 py-3 rounded-xl bg-nova-cyan text-black text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all disabled:opacity-50"
                     >
                        {loading ? 'Processing...' : 'Update Identity'}
                     </button>
                  </div>
               </section>
            )}

            {activeTab === 'visibility' && (
               <section className="space-y-6">
                  <div className="p-8 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
                     <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-2xl bg-nova-green/10 flex items-center justify-center border border-nova-green/20">
                              <Globe size={18} className="text-nova-green" />
                           </div>
                           <div>
                              <h4 className="text-sm font-black uppercase tracking-tight">Collaboration Mode</h4>
                              <p className="text-[8px] text-white/40 uppercase tracking-widest">Allow others to send collaboration requests</p>
                           </div>
                        </div>
                        <button
                          onClick={() => {
                            const next = !collaboration;
                            setCollaboration(next);
                            handleUpdateVisibility(next, contactVisibility);
                          }}
                          className={`w-12 h-6 rounded-full p-1 transition-all flex ${collaboration ? 'bg-nova-green justify-end' : 'bg-white/10 justify-start'}`}
                        >
                           <div className="w-4 h-4 rounded-full bg-black" />
                        </button>
                     </div>

                     <div className="space-y-6 pt-8 border-t border-white/5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Contact Visibility</h4>
                        <div className="space-y-4">
                           {[
                              { id: 'email', label: 'Email Address', icon: Mail },
                              { id: 'phone', label: 'Phone Number', icon: Phone },
                              { id: 'socials', label: 'Social Links', icon: LinkIcon },
                           ].map((item) => (
                              <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                                 <div className="flex items-center gap-4">
                                    <item.icon size={16} className="text-white/20" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{item.label}</span>
                                 </div>
                                 <button
                                   onClick={() => {
                                      const next = { ...contactVisibility, [item.id]: !contactVisibility[item.id as keyof typeof contactVisibility] };
                                      setContactVisibility(next);
                                      handleUpdateVisibility(collaboration, next);
                                   }}
                                   className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                                      contactVisibility[item.id as keyof typeof contactVisibility] ? 'bg-nova-cyan/10 text-nova-cyan border border-nova-cyan/20' : 'bg-white/5 text-white/20 border border-white/5'
                                   }`}
                                 >
                                    {contactVisibility[item.id as keyof typeof contactVisibility] ? 'Public' : 'Hidden'}
                                 </button>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </section>
            )}
         </div>

         <div className="space-y-6">
            <div className="p-8 rounded-[3rem] border border-white/5 bg-gradient-to-br from-nova-cyan/10 to-transparent">
               <Shield size={24} className="text-nova-cyan mb-6" />
               <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-2">Verified Status</h4>
               <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-widest mb-6">
                  Your node is currently verified. Maintaining a high activity score is required for verification persistence.
               </p>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-nova-green animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-nova-green">Protocol Active</span>
               </div>
            </div>

            <button className="w-full p-8 rounded-[3rem] border border-red-500/10 bg-red-500/[0.02] hover:bg-red-500/[0.05] transition-all flex items-center justify-between group">
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500/60 mb-1">Deactivate Node</h4>
                  <p className="text-[8px] text-white/20 uppercase tracking-widest">Permanent removal</p>
               </div>
               <Trash2 size={20} className="text-red-500/20 group-hover:text-red-500 transition-colors" />
            </button>
         </div>
      </div>
    </div>
  );
}
