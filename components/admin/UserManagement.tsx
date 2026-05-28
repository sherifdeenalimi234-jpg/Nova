"use client";

import React, { useState } from 'react';
import { Search, UserCog, Shield, UserMinus } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  is_admin: boolean;
  is_verified_creator: boolean;
  created_at: string;
}

export default function UserManagement({ initialUsers = [] }: { initialUsers?: UserProfile[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg font-bold tracking-widest uppercase text-white">Node Directory</h3>

        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-nova-cyan transition-colors" />
          <input
            type="text"
            placeholder="Search Ecosystem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-nova-cyan/50 focus:bg-white/10 transition-all w-full md:w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">
              <th className="px-4 py-2">Identity</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Synchronization</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 rounded-l-xl bg-white/2 group-hover:bg-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nova-cyan/20 to-nova-purple/20 flex items-center justify-center border border-white/10">
                       <UserCog size={14} className="text-white/80" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-none mb-1">{user.full_name}</div>
                      <div className="text-[9px] text-white/30 font-mono tracking-tighter uppercase">{user.id.substring(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 bg-white/2 group-hover:bg-transparent">
                   <div className="flex gap-2">
                      {user.is_admin && (
                        <span className="px-1.5 py-0.5 rounded bg-nova-cyan/20 text-nova-cyan text-[8px] font-black uppercase tracking-widest border border-nova-cyan/30">Admin</span>
                      )}
                      {user.is_verified_creator && (
                        <span className="px-1.5 py-0.5 rounded bg-nova-purple/20 text-nova-purple text-[8px] font-black uppercase tracking-widest border border-nova-purple/30">Creator</span>
                      )}
                      {!user.is_admin && !user.is_verified_creator && (
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/30 text-[8px] font-black uppercase tracking-widest">Free</span>
                      )}
                   </div>
                </td>
                <td className="px-4 py-3 rounded-r-xl bg-white/2 group-hover:bg-transparent text-right">
                   <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-nova-cyan hover:bg-nova-cyan/10 transition-all">
                        <Shield size={14} />
                      </button>
                      <button className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all">
                        <UserMinus size={14} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
