"use client";

import React, { useEffect, useState } from "react";
import { Heart, Eye, MoreVertical, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const FeedGrid = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(full_name, avatar_url)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPosts(data);
      }
      setLoading(false);
    }
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="h-[40vh] flex items-center justify-center">
        <Loader2 className="text-nova-cyan animate-spin" size={32} />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="h-[40vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-6">
           <div className="w-2 h-2 rounded-full bg-nova-cyan/20 animate-ping" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Ecosystem Quiet</h3>
        <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-2">Waiting for incoming research signals...</p>
      </div>
    );
  }

  return (
    <div className="px-0 pb-32">
      {posts.map((post) => (
        <article key={post.id} className="mb-12 border-b border-white/5 pb-8">
          {/* Header */}
          <div className="px-6 flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nova-cyan/20 to-nova-purple/20 border border-white/10 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                {post.author?.avatar_url ? (
                  <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  (post.author?.full_name || "??").substring(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight">{post.author?.full_name || "Unknown Entity"}</div>
                <div className="text-[9px] text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <span className="w-0.5 h-0.5 bg-white/20 rounded-full" />
                  <span className="text-nova-cyan">{post.post_type.toUpperCase().replace('_', ' ')}</span>
                </div>
              </div>
            </div>
            <button className="text-white/40">
              <MoreVertical size={18} />
            </button>
          </div>

          {/* Media */}
          <div className="w-full aspect-square bg-[#0a0a0b] relative overflow-hidden group">
            <img
              src={post.media_url || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000"}
              alt="Post media"
              className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
            />
            {/* Subtle digital overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-repeat" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>

          {/* Interaction Bar */}
          <div className="px-6 mt-5">
            <div className="flex items-center gap-8 mb-4">
              <button className="flex items-center gap-2 group transition-all">
                <Heart size={20} className="text-white/60 group-hover:text-nova-cyan group-active:scale-125 transition-all" />
                <span className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white/70">Appreciate</span>
                <span className="text-[10px] text-nova-cyan/60 ml-1">0</span>
              </button>

              <button className="flex items-center gap-2 group transition-all">
                <Eye size={20} className="text-white/60 group-hover:text-nova-cyan transition-all" />
                <span className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white/70">View</span>
                <span className="text-[10px] text-nova-cyan/60 ml-1">0</span>
              </button>
            </div>

            <p className="text-[13px] text-white/70 leading-relaxed font-light">
              <span className="font-bold text-white mr-2">{post.author?.full_name}</span>
              {post.content}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
};

export default FeedGrid;
