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
  MoreHorizontal
} from 'lucide-react';
import { moderatePost, featurePost } from '@/lib/actions/admin';
import { cn } from '@/lib/utils';

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
    { id: 'all', label: 'All Logs', icon: Filter },
    { id: 'posts', label: 'Research', icon: MessageSquare },
    { id: 'surveys', label: 'Protocols', icon: BarChart3 },
    { id: 'ai_visuals', label: 'Visuals', icon: ImageIcon },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold tracking-widest uppercase text-white leading-none">Content Moderation</h3>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">Ecosystem integrity filter</p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab.id
                  ? "bg-nova-cyan text-black shadow-[0_0_15px_rgba(0,242,255,0.3)]"
                  : "text-white/40 hover:text-white hover:bg-white/5"
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
          className="w-full bg-white/2 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs uppercase tracking-widest text-white placeholder:text-white/20 outline-none focus:border-nova-cyan/50 focus:bg-white/5 transition-all"
        />
      </div>

      <div className="grid gap-4">
        {filteredPosts.length === 0 ? (
          <div className="p-20 rounded-[2rem] border border-dashed border-white/5 bg-white/2 flex flex-col items-center justify-center text-white/10 gap-4">
            <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center">
               <Check size={32} className="opacity-20" />
            </div>
            <p className="text-xs uppercase tracking-[0.3em]">Integrity Maintained • No Pending Logs</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="p-5 rounded-2xl bg-white/2 border border-white/5 flex flex-col md:flex-row md:items-center justify-between group hover:border-white/20 hover:bg-white/5 transition-all">
              <div className="flex-1 mb-4 md:mb-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-nova-purple/10 text-nova-purple border border-nova-purple/20">
                    {post.post_type}
                  </span>
                  {post.is_featured && (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-nova-cyan">
                      <Star size={10} fill="currentColor" /> Featured
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mb-1 group-hover:text-nova-cyan transition-colors">{post.title}</h4>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono">
                  Origin: {post.author.full_name} • Seq: {new Date(post.created_at).getTime().toString(16).toUpperCase()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {processingId === post.id ? (
                  <Loader2 size={16} className="animate-spin text-nova-cyan mx-4" />
                ) : (
                  <>
                    <button
                      onClick={() => handleFeature(post.id, !!post.is_featured)}
                      className={cn(
                        "p-2.5 rounded-xl border transition-all",
                        post.is_featured
                          ? "bg-nova-cyan/20 border-nova-cyan/40 text-nova-cyan"
                          : "bg-white/5 border-white/10 text-white/30 hover:text-nova-cyan hover:border-nova-cyan/30"
                      )}
                      title="Promote to Featured"
                    >
                      <Star size={16} fill={post.is_featured ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => handleAction(post.id, 'approved')}
                      className="p-2.5 rounded-xl bg-nova-green/10 border border-nova-green/20 text-nova-green hover:bg-nova-green/20 transition-all"
                      title="Approve Logic"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleAction(post.id, 'rejected')}
                      className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all"
                      title="Purge Logic"
                    >
                      <X size={16} />
                    </button>
                  </>
                )}
                <div className="w-px h-6 bg-white/10 mx-1" />
                <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/30 hover:text-white transition-all">
                  <Eye size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
