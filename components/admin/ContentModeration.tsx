"use client";

import React, { useState } from 'react';
import { Check, X, Eye, ExternalLink } from 'lucide-react';

interface PendingPost {
  id: string;
  title: string;
  post_type: string;
  author: {
    full_name: string;
  };
  created_at: string;
}

export default function ContentModeration({ initialPosts = [] }: { initialPosts?: PendingPost[] }) {
  const [posts, setPosts] = useState(initialPosts);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    // Logic to update status in Supabase will go here
    setPosts(posts.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-widest uppercase text-white">Pending Approval</h3>
        <span className="px-3 py-1 rounded-full bg-nova-cyan/10 border border-nova-cyan/20 text-[10px] font-bold text-nova-cyan">
          {posts.length} REQUESTS
        </span>
      </div>

      {posts.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-white/5 bg-white/2 flex items-center justify-center text-white/20 text-xs uppercase tracking-widest">
          Queue Clear
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <div key={post.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-nova-cyan/30 transition-all">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-nova-purple/20 text-nova-purple">
                    {post.post_type}
                  </span>
                  <h4 className="text-sm font-bold text-white leading-none">{post.title}</h4>
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  by {post.author.full_name} • {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleAction(post.id, 'approved')}
                  className="p-2 rounded-lg bg-nova-green/10 text-nova-green hover:bg-nova-green/20 transition-colors"
                  title="Approve"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => handleAction(post.id, 'rejected')}
                  className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                  title="Reject"
                >
                  <X size={16} />
                </button>
                <button className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white transition-colors">
                  <Eye size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
