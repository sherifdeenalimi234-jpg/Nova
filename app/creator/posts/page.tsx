"use client";

import React from 'react';
import {
  Plus,
  FileText,
  Eye,
  MoreVertical,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import Link from 'next/link';

export default function PostsManagementPage() {
  const posts = [
    { id: '1', title: 'Neural Grid Dynamics', type: 'Research', status: 'Pending', date: 'Oct 24, 2024', views: '1.2K' },
    { id: '2', title: 'Nexus Core Update', type: 'Project', status: 'Approved', date: 'Oct 20, 2024', views: '8.5K' },
    { id: '3', title: 'Ecosystem Analysis', type: 'Research', status: 'Rejected', date: 'Oct 15, 2024', views: '-' },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Transmissions</h1>
           <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Manage your ecosystem logs and intel</p>
        </div>
        <Link href="/creator/posts/new" className="px-6 py-3 rounded-2xl bg-nova-cyan text-black text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all flex items-center gap-2">
           <Plus size={14} />
           New Transmission
        </Link>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between p-6 rounded-[2rem] border border-white/5 bg-white/[0.02]">
         <div className="flex items-center gap-4 flex-1 max-w-md">
            <Search size={16} className="text-white/20" />
            <input
              type="text"
              placeholder="Filter transmissions..."
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 w-full"
            />
         </div>
         <div className="flex items-center gap-4">
            <button className="p-2 text-white/40 hover:text-white transition-colors">
               <Filter size={18} />
            </button>
            {['All', 'Approved', 'Pending', 'Draft'].map((tab) => (
              <button key={tab} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${tab === 'All' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
                 {tab}
              </button>
            ))}
         </div>
      </div>

      <div className="p-8 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className="border-b border-white/5">
                     <th className="text-left py-4 px-4 text-[9px] font-black uppercase tracking-widest text-white/20">Title</th>
                     <th className="text-left py-4 px-4 text-[9px] font-black uppercase tracking-widest text-white/20">Category</th>
                     <th className="text-left py-4 px-4 text-[9px] font-black uppercase tracking-widest text-white/20">Status</th>
                     <th className="text-left py-4 px-4 text-[9px] font-black uppercase tracking-widest text-white/20">Views</th>
                     <th className="text-left py-4 px-4 text-[9px] font-black uppercase tracking-widest text-white/20">Date</th>
                     <th className="text-right py-4 px-4"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {posts.map((post) => (
                    <tr key={post.id} className="group hover:bg-white/[0.02] transition-all">
                       <td className="py-6 px-4">
                          <span className="text-xs font-bold text-white group-hover:text-nova-cyan transition-colors">{post.title}</span>
                       </td>
                       <td className="py-6 px-4 text-[10px] font-black text-white/40 uppercase tracking-widest">{post.type}</td>
                       <td className="py-6 px-4">
                          <span className={`px-3 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${
                             post.status === 'Approved' ? 'bg-nova-green/10 border-nova-green/20 text-nova-green' :
                             post.status === 'Pending' ? 'bg-nova-orange/10 border-nova-orange/20 text-nova-orange' :
                             'bg-red-500/10 border-red-500/20 text-red-500'
                          }`}>
                             {post.status}
                          </span>
                       </td>
                       <td className="py-6 px-4 text-[10px] font-black text-white/60">{post.views}</td>
                       <td className="py-6 px-4 text-[10px] font-black text-white/40 uppercase tracking-widest">{post.date}</td>
                       <td className="py-6 px-4 text-right">
                          <button className="p-2 text-white/20 hover:text-white">
                             <MoreVertical size={16} />
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
