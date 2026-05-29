"use client";

import React, { useState } from 'react';
import {
  Check,
  X,
  Eye,
  Loader2,
  Star,
  Filter,
  Search,
  MessageSquare,
  BarChart3,
  Image as ImageIcon,
  MoreHorizontal,
  ChevronRight,
  Clock,
  LayoutGrid
} from 'lucide-react';
import { moderatePost, featurePost } from '@/lib/actions/admin';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PendingPost {
  id: string;
  title: string;
  post_type: string;
  author: {
    full_name: string;
  };
  created_at: string;
  is_featured?: boolean;
}

type TabType = 'all' | 'posts' | 'surveys' | 'ai_visuals';

export default function ContentModeration({ initialPosts = [] }: { initialPosts?: PendingPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    const { error } = await moderatePost(id, status);
    if (!error) {
      setPosts(posts.filter(p => p.id !== id));
    } else {
      alert("System failure during moderation: " + (error as any).message);
    }
    setProcessingId(null);
  };

  const handleFeature = async (id: string, currentFeatured: boolean) => {
    setProcessingId(id);
    const { error } = await featurePost(id, !currentFeatured);
    if (!error) {
      setPosts(posts.map(p => p.id === id ? { ...p, is_featured: !currentFeatured } : p));
    }
    setProcessingId(null);
  };

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.author.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'surveys') return matchesSearch && p.post_type === 'survey';
    if (activeTab === 'ai_visuals') return matchesSearch && p.post_type === 'ai_visual';
    return matchesSearch && !['survey', 'ai_visual'].includes(p.post_type);
  });

  const tabs = [
    { id: 'all', label: 'All', icon: LayoutGrid },
    { id: 'posts', label: 'Nodes', icon: MessageSquare },
    { id: 'surveys', label: 'Protos', icon: BarChart3 },
    { id: 'ai_visuals', label: 'Visuals', icon: ImageIcon },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-base md:text-lg font-bold tracking-widest uppercase text-white leading-none">Integrity Matrix</h3>
          <p className="text-[9px] md:text-[10px] text-white/30 uppercase tracking-widest mt-2 font-medium">Ecosystem logic filter</p>
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 overflow-x-auto custom-scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-nova-cyan text-black shadow-[0_0_15px_rgba(0,242,255,0.3)]"
                  : "text-white/40 hover:text-white"
              )}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative group">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-nova-cyan transition-colors" />
        <input
          type="text"
          placeholder="Search metadata..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/2 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-xs uppercase tracking-widest text-white placeholder:text-white/20 outline-none focus:border-nova-cyan/50 transition-all"
        />
      </div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-16 md:p-24 rounded-[2.5rem] border border-dashed border-white/5 bg-white/2 flex flex-col items-center justify-center text-white/10 gap-5 text-center"
            >
              <div className="w-16 h-16 rounded-3xl border border-white/5 flex items-center justify-center bg-white/2">
                 <Check size={32} className="opacity-20" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.4em] font-black leading-relaxed">System Integrity Clear • No Pending Entries</p>
            </motion.div>
          ) : (
            filteredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 md:p-6 rounded-3xl bg-white/2 border border-white/5 flex flex-col group hover:border-white/20 hover:bg-white/5 transition-all relative overflow-hidden"
              >
                <div className="flex-1 mb-5 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-nova-purple/10 text-nova-purple border border-nova-purple/20">
                        {post.post_type}
                      </span>
                      {post.is_featured && (
                        <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-nova-cyan bg-nova-cyan/10 px-2 py-0.5 rounded-lg border border-nova-cyan/20">
                          <Star size={10} fill="currentColor" /> Promoted
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[8px] text-white/20 font-black uppercase tracking-tighter">
                       <Clock size={10} />
                       {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <h4 className="text-sm md:text-base font-bold text-white mb-2 leading-snug group-hover:text-nova-cyan transition-colors">{post.title}</h4>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-white/40">
                          {post.author.full_name.charAt(0)}
                       </div>
                       <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                         {post.author.full_name}
                       </p>
                    </div>
                    <button className="text-nova-cyan/40 hover:text-nova-cyan transition-colors">
                       <Eye size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 relative z-10">
                  {processingId === post.id ? (
                    <div className="col-span-3 flex items-center justify-center py-3">
                      <Loader2 size={20} className="animate-spin text-nova-cyan" />
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleFeature(post.id, !!post.is_featured)}
                        className={cn(
                          "flex items-center justify-center gap-2 py-3.5 rounded-2xl border transition-all text-[9px] font-black uppercase tracking-widest",
                          post.is_featured
                            ? "bg-nova-cyan/10 border-nova-cyan/30 text-nova-cyan"
                            : "bg-white/5 border-white/10 text-white/30 hover:border-nova-cyan/30"
                        )}
                      >
                        <Star size={14} fill={post.is_featured ? "currentColor" : "none"} />
                        {post.is_featured ? 'Promoted' : 'Promote'}
                      </button>
                      <button
                        onClick={() => handleAction(post.id, 'approved')}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-nova-green/10 border border-nova-green/20 text-nova-green hover:bg-nova-green/20 transition-all text-[9px] font-black uppercase tracking-widest"
                      >
                        <Check size={16} /> OK
                      </button>
                      <button
                        onClick={() => handleAction(post.id, 'rejected')}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all text-[9px] font-black uppercase tracking-widest"
                      >
                        <X size={16} /> FAIL
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
