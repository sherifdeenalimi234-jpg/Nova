"use client";

import React, { useState } from 'react';
import {
  Search,
  UserCog,
  Shield,
  UserMinus,
  MoreVertical,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Filter,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { suspendUser, banUser, removeUser } from '@/lib/actions/admin';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfile {
  id: string;
  full_name: string;
  is_admin: boolean;
  is_verified_creator: boolean;
  is_suspended?: boolean;
  is_banned?: boolean;
  created_at: string;
}

export default function UserManagement({ initialUsers = [] }: { initialUsers?: UserProfile[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'creator' | 'standard'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleSuspend = async (id: string) => {
    setProcessingId(id);
    const { error } = await suspendUser(id);
    if (!error) {
      setUsers(users.map(u => u.id === id ? { ...u, is_suspended: true } : u));
    }
    setProcessingId(null);
  };

  const handleBan = async (id: string) => {
    if (!confirm("Are you sure you want to ban this node?")) return;
    setProcessingId(id);
    const { error } = await banUser(id);
    if (!error) {
      setUsers(users.map(u => u.id === id ? { ...u, is_banned: true } : u));
    }
    setProcessingId(null);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'admin') return matchesSearch && u.is_admin;
    if (filter === 'creator') return matchesSearch && u.is_verified_creator;
    return matchesSearch && !u.is_admin && !u.is_verified_creator;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative group w-full md:max-w-md">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-nova-cyan transition-colors" />
          <input
            type="text"
            placeholder="Search ecosystem nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/2 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-[11px] uppercase tracking-widest text-white placeholder:text-white/20 outline-none focus:border-nova-cyan/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 overflow-x-auto custom-scrollbar-hide">
          {(['all', 'admin', 'creator', 'standard'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                filter === f
                  ? "bg-white/10 text-white"
                  : "text-white/30 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive User Display */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filteredUsers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center rounded-[2.5rem] border border-dashed border-white/5 bg-white/2"
            >
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/10 italic font-black">Directory Neutralized • No Matches</p>
            </motion.div>
          ) : (
            filteredUsers.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-5 rounded-3xl bg-white/2 border border-white/5 hover:border-white/20 transition-all group overflow-hidden relative"
              >
                <div className="flex items-center gap-4 mb-5">
                   <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center border border-white/10 group-hover:border-nova-cyan/30 transition-all shrink-0">
                      <UserCog size={20} className="text-white/30 group-hover:text-nova-cyan transition-colors" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                         <h4 className="text-sm font-black text-white truncate">{user.full_name || "Unknown Entity"}</h4>
                         <span className={cn(
                           "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                           user.is_banned ? "bg-red-500/10 text-red-500 border-red-500/20" :
                           user.is_suspended ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                           "bg-nova-green/10 text-nova-green border-nova-green/20"
                         )}>
                           {user.is_banned ? 'Banned' : user.is_suspended ? 'Suspended' : 'Active'}
                         </span>
                      </div>
                      <p className="text-[9px] text-white/20 font-mono tracking-tighter uppercase truncate">{user.id}</p>
                   </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-5">
                   <div className="flex gap-2">
                      {user.is_admin && (
                        <span className="px-2 py-0.5 rounded bg-nova-cyan/10 text-nova-cyan text-[8px] font-black uppercase tracking-widest border border-nova-cyan/20">Admin</span>
                      )}
                      {user.is_verified_creator && (
                        <span className="px-2 py-0.5 rounded bg-nova-purple/10 text-nova-purple text-[8px] font-black uppercase tracking-widest border border-nova-purple/20">Creator</span>
                      )}
                      {!user.is_admin && !user.is_verified_creator && (
                        <span className="px-2 py-0.5 rounded bg-white/5 text-white/30 text-[8px] font-black uppercase tracking-widest">Guest</span>
                      )}
                   </div>

                   <div className="flex items-center gap-2">
                      {processingId === user.id ? (
                        <Loader2 size={16} className="animate-spin text-nova-cyan mx-2" />
                      ) : (
                        <>
                          <button
                            onClick={() => handleSuspend(user.id)}
                            disabled={user.is_suspended || user.is_banned}
                            className="p-3 rounded-xl bg-white/5 text-white/30 hover:text-orange-500 hover:bg-orange-500/10 transition-all disabled:opacity-20"
                            title="Suspend Node"
                          >
                            <ShieldAlert size={16} />
                          </button>
                          <button
                            onClick={() => handleBan(user.id)}
                            disabled={user.is_banned}
                            className="p-3 rounded-xl bg-white/5 text-white/30 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-20"
                            title="Ban Node"
                          >
                            <Shield size={16} />
                          </button>
                          <button className="p-3 rounded-xl bg-white/5 text-white/30 hover:text-white transition-all">
                            <MoreVertical size={16} />
                          </button>
                        </>
                      )}
                   </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
