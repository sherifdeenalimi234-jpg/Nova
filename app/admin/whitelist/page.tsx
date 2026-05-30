"use client";

import React, { useState, useEffect } from 'react';
import { getWhitelist, addToWhitelist, removeFromWhitelist } from '@/lib/actions/admin';
import { CREATOR_WHITELIST } from '@/lib/constants';
import { Mail, Plus, Trash2, Loader2, ShieldCheck, Search, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WhitelistPage() {
  const [whitelist, setWhitelist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadWhitelist() {
      const { data } = await getWhitelist();
      // Combine with hardcoded whitelist for display
      const dbEmails = data?.map(d => d.email) || [];
      const combined = [...new Set([...CREATOR_WHITELIST.map(e => e.toLowerCase()), ...dbEmails])];
      setWhitelist(combined);
      setLoading(false);
    }
    loadWhitelist();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setAdding(true);
    const { error } = await addToWhitelist(newEmail);
    if (!error) {
      setWhitelist(prev => [...new Set([...prev, newEmail.toLowerCase()])]);
      setNewEmail('');
    } else {
      alert(error.message);
    }
    setAdding(false);
  };

  const handleRemove = async (email: string) => {
    if (CREATOR_WHITELIST.map(e => e.toLowerCase()).includes(email.toLowerCase())) {
      alert("Cannot remove hardcoded whitelist emails from here. Please modify lib/constants.ts.");
      return;
    }
    if (!confirm(`Remove ${email} from whitelist?`)) return;

    const { error } = await removeFromWhitelist(email);
    if (!error) {
      setWhitelist(prev => prev.filter(e => e !== email));
    } else {
      alert(error.message);
    }
  };

  const filteredWhitelist = whitelist.filter(email =>
    email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="text-nova-cyan animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-[#0a0a0b] min-h-screen text-white font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10"
      >
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            Creator <span className="text-nova-cyan">Whitelist</span>
          </h1>
          <p className="text-white/40 mt-2 tracking-[0.2em] uppercase text-[10px]">
            Email-based Access Control
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add New Email */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <Plus size={14} className="text-nova-cyan" /> Add Creator
              </h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none focus:border-nova-cyan/50 transition-all"
                    required
                  />
                </div>
                <button
                  disabled={adding}
                  className="w-full py-4 rounded-2xl bg-nova-cyan text-black text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,255,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Authorize Email
                </button>
              </form>
            </div>

            <div className="mt-6 p-6 rounded-[2rem] border border-red-500/10 bg-red-500/5 backdrop-blur-xl">
               <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-500/60 leading-relaxed uppercase tracking-widest font-bold">
                    Emails in this list bypass all verification protocols and receive immediate Creator Studio access.
                  </p>
               </div>
            </div>
          </div>

          {/* Whitelist Table */}
          <div className="lg:col-span-2">
            <div className="p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest">Authorized Creators</h3>
                <div className="relative">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="text"
                    placeholder="Search whitelist..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] uppercase outline-none focus:border-nova-cyan/50"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {filteredWhitelist.map((email) => {
                    const isHardcoded = CREATOR_WHITELIST.map(e => e.toLowerCase()).includes(email.toLowerCase());
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={email}
                        className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border",
                            isHardcoded ? "bg-nova-purple/10 border-nova-purple/20 text-nova-purple" : "bg-nova-cyan/10 border-nova-cyan/20 text-nova-cyan"
                          )}>
                            <Mail size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{email}</p>
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
                              {isHardcoded ? "SYSTEM PROTECTED" : "DYNAMIC AUTH"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                             "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                             isHardcoded ? "bg-nova-purple/10 text-nova-purple border-nova-purple/20" : "bg-nova-cyan/10 text-nova-cyan border-nova-cyan/20"
                          )}>
                             <ShieldCheck size={10} className="inline mr-1" /> Verified
                          </div>
                          {!isHardcoded && (
                            <button
                              onClick={() => handleRemove(email)}
                              className="p-2 hover:bg-red-500/10 rounded-lg text-white/10 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {filteredWhitelist.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">No matching emails found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
