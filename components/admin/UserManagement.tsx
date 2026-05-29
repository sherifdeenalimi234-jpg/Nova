"use client";

import React, { useState } from 'react';
import {
  Search,
  UserCog,
  Shield,
  UserMinus,
  Filter,
  MoreVertical,
  Activity,
  ShieldAlert,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { suspendUser, banUser, removeUser } from '@/lib/actions/admin';
import { cn } from '@/lib/utils';

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative group flex-1 max-w-md">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-nova-cyan transition-colors" />
          <input
            type="text"
            placeholder="Search ecosystem nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/2 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs uppercase tracking-widest text-white placeholder:text-white/20 outline-none focus:border-nova-cyan/50 focus:bg-white/5 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          {(['all', 'admin', 'creator', 'standard'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                filter === f
                  ? "bg-white/10 text-white"
                  : "text-white/30 hover:text-white/60"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-black">
              <th className="px-6 py-4">Identity Matrix</th>
              <th className="px-6 py-4">Protocol Access</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Synchronization</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-white/10 italic">No matching nodes found in directory</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="group transition-all">
                  <td className="px-6 py-4 rounded-l-2xl bg-white/2 border-y border-l border-white/5 group-hover:bg-white/5 group-hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center border border-white/10 group-hover:border-nova-cyan/30 transition-all relative">
                         <UserCog size={18} className="text-white/40 group-hover:text-nova-cyan transition-colors" />
                         {(user.is_suspended || user.is_banned) && (
                           <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black" />
                         )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white mb-1">{user.full_name || "Unknown Entity"}</div>
                        <div className="text-[9px] text-white/20 font-mono tracking-tighter uppercase">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 bg-white/2 border-y border-white/5 group-hover:bg-white/5 group-hover:border-white/10 transition-all">
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
                  </td>
                  <td className="px-6 py-4 bg-white/2 border-y border-white/5 group-hover:bg-white/5 group-hover:border-white/10 transition-all">
                    {user.is_banned ? (
                      <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Banned</span>
                    ) : user.is_suspended ? (
                      <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Suspended</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[9px] font-black text-nova-green uppercase tracking-widest">
                        <CheckCircle2 size={10} /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 rounded-r-2xl bg-white/2 border-y border-r border-white/5 group-hover:bg-white/5 group-hover:border-white/10 text-right transition-all">
                     <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        {processingId === user.id ? (
                          <Loader2 size={14} className="animate-spin text-nova-cyan mx-4" />
                        ) : (
                          <>
                            <button
                              onClick={() => handleSuspend(user.id)}
                              disabled={user.is_suspended || user.is_banned}
                              className="p-2 rounded-lg bg-white/5 text-white/30 hover:text-orange-500 hover:bg-orange-500/10 transition-all disabled:opacity-20"
                              title="Suspend Access"
                            >
                              <ShieldAlert size={14} />
                            </button>
                            <button
                              onClick={() => handleBan(user.id)}
                              disabled={user.is_banned}
                              className="p-2 rounded-lg bg-white/5 text-white/30 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-20"
                              title="Ban Node"
                            >
                              <Shield size={14} />
                            </button>
                            <button className="p-2 rounded-lg bg-white/5 text-white/30 hover:text-red-500 hover:bg-red-500/10 transition-all">
                              <UserMinus size={14} />
                            </button>
                          </>
                        )}
                        <div className="w-px h-4 bg-white/10 mx-1" />
                        <button className="p-2 rounded-lg bg-white/5 text-white/30 hover:text-white transition-all">
                          <MoreVertical size={14} />
                        </button>
                     </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
