"use client";

import React, { useState } from 'react';
import { X, Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import { createPost } from '@/lib/actions/posts';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('research');
  const [mediaUrl, setMediaUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await createPost({
      title,
      content,
      post_type: postType,
      media_url: mediaUrl || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000" // Default if empty for now
    });

    if (!error) {
      alert("Intelligence synchronized. Pending admin moderation.");
      onClose();
      setTitle('');
      setContent('');
      setMediaUrl('');
    } else {
      const errorMessage = typeof error === 'string' ? error : error.message;
      alert("Upload failed: " + errorMessage);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-[#0a0a0b] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-nova-cyan">Publish Research Signal</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Signal Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nova-cyan/50 transition-all"
              placeholder="E.g. Quantum Stability Protocol v1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Category</label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nova-cyan/50 transition-all appearance-none"
              >
                <option value="research">Research</option>
                <option value="project">Project</option>
                <option value="innovation">Innovation</option>
                <option value="achievement">Achievement</option>
                <option value="ai_visual">AI Visual</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Media URL</label>
              <div className="relative">
                <input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-nova-cyan/50 transition-all"
                  placeholder="Unsplash URL..."
                />
                <ImageIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Signal Intelligence (Content)</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nova-cyan/50 transition-all resize-none"
              placeholder="Describe your research update..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-nova-cyan to-nova-purple text-black text-[10px] font-black uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            Synchronize Signal
          </button>
        </form>
      </div>
    </div>
  );
}
