"use client";

import React from "react";
import { Heart, MessageSquare, Share2, MoreVertical } from "lucide-react";

const posts = [
  {
    id: 1,
    user: "Quantum Lab",
    category: "Research",
    time: "2h ago",
    content: "Initial testing of the Q-Link protocol shows 99.9% stability in vacuum environments.",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000",
    likes: "1.2k"
  },
  {
    id: 2,
    user: "Marcus Chen",
    category: "Innovation",
    time: "5h ago",
    content: "New concepts for the floating campus are now available for review.",
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=1000",
    likes: "842"
  },
  {
    id: 3,
    user: "BioSynth Hub",
    category: "Survey",
    time: "8h ago",
    content: "How should AI ethics be governed in distributed innovation ecosystems?",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1000",
    likes: "3.5k"
  }
];

const FeedGrid = () => {
  return (
    <div className="px-0 pb-32">
      {posts.map((post) => (
        <article key={post.id} className="mb-8 border-b border-white/5 pb-8">
          <div className="px-6 flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10" />
              <div>
                <div className="text-sm font-bold">{post.user}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <span>{post.time}</span>
                  <span className="w-1 h-1 bg-white/20 rounded-full" />
                  <span className="text-nova-cyan">{post.category}</span>
                </div>
              </div>
            </div>
            <button className="text-white/40">
              <MoreVertical size={20} />
            </button>
          </div>

          <div className="w-full aspect-square bg-[#111] relative overflow-hidden group">
            <img
              src={post.image}
              alt="Post media"
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          <div className="px-6 mt-4">
            <div className="flex items-center gap-6 mb-3">
              <button className="flex items-center gap-2 group">
                <Heart size={22} className="text-white/60 group-active:fill-red-500 group-active:text-red-500 transition-colors" />
                <span className="text-xs text-white/40">{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 group">
                <MessageSquare size={22} className="text-white/60" />
              </button>
              <button className="flex items-center gap-2 group">
                <Share2 size={22} className="text-white/60" />
              </button>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              <span className="font-bold mr-2">{post.user}</span>
              {post.content}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
};

export default FeedGrid;
