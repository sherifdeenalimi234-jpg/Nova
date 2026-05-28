"use client";

import React from "react";
import { Heart, Eye, MoreVertical } from "lucide-react";

const posts = [
  {
    id: 1,
    user: "Quantum Research Lab",
    category: "RESEARCH ART",
    time: "2H AGO",
    content: "Initial testing of the Q-Link protocol shows 99.9% stability in vacuum environments.",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000",
    appreciations: "1.2K",
    views: "15.4K"
  },
  {
    id: 2,
    user: "Nova Architects",
    category: "PROJECT",
    time: "5H AGO",
    content: "New concepts for the floating campus are now available for review. Integrating bio-mimetic structures with kinetic facades.",
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=1000",
    appreciations: "842",
    views: "8.2K"
  },
  {
    id: 3,
    user: "BioSynth Hub",
    category: "SURVEY",
    time: "8H AGO",
    content: "Global inquiry on AI ethics in distributed innovation ecosystems. Join the discussion below.",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1000",
    appreciations: "3.5K",
    views: "42K"
  },
  {
    id: 4,
    user: "CyberNetic Arts",
    category: "AI VISUAL",
    time: "12H AGO",
    content: "Visualizing the flow of community intelligence through neural architecture.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000",
    appreciations: "2.1K",
    views: "12.8K"
  }
];

const FeedGrid = () => {
  return (
    <div className="px-0 pb-32">
      {posts.map((post) => (
        <article key={post.id} className="mb-12 border-b border-white/5 pb-8">
          {/* Header */}
          <div className="px-6 flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nova-cyan/20 to-nova-purple/20 border border-white/10 flex items-center justify-center text-[10px] font-bold">
                {post.user.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight">{post.user}</div>
                <div className="text-[9px] text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span>{post.time}</span>
                  <span className="w-0.5 h-0.5 bg-white/20 rounded-full" />
                  <span className="text-nova-cyan">{post.category}</span>
                </div>
              </div>
            </div>
            <button className="text-white/40">
              <MoreVertical size={18} />
            </button>
          </div>

          {/* Media */}
          <div className="w-full aspect-square bg-[#0a0a0a] relative overflow-hidden group">
            <img
              src={post.image}
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
                <span className="text-[10px] text-nova-cyan/60 ml-1">{post.appreciations}</span>
              </button>

              <button className="flex items-center gap-2 group transition-all">
                <Eye size={20} className="text-white/60 group-hover:text-nova-cyan transition-all" />
                <span className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white/70">View</span>
                <span className="text-[10px] text-nova-cyan/60 ml-1">{post.views}</span>
              </button>
            </div>

            <p className="text-[13px] text-white/70 leading-relaxed font-light">
              <span className="font-bold text-white mr-2">{post.user}</span>
              {post.content}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
};

export default FeedGrid;
