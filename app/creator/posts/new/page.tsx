"use client";

import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  ChevronRight,
  Send,
  Eye,
  Settings,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const POST_TYPES = [
  { id: 'research', label: 'Research', icon: FileText, color: 'text-nova-purple' },
  { id: 'project', label: 'Project Update', icon: Send, color: 'text-nova-cyan' },
  { id: 'innovation', label: 'Innovation', icon: Eye, color: 'text-nova-green' },
  { id: 'achievement', label: 'Achievement', icon: LinkIcon, color: 'text-nova-orange' },
];

export default function CreatePostPage() {
  const [postType, setPostType] = useState('research');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMedia(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Publish Intel</h1>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Initialize a new ecosystem transmission</p>
         </div>
         <div className="flex gap-4">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-6 py-3 rounded-2xl border border-white/10 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
            >
               <Eye size={14} />
               {previewMode ? 'Edit Mode' : 'Preview'}
            </button>
            <button className="px-6 py-3 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-nova-cyan transition-all flex items-center gap-2">
               <Send size={14} />
               Transmit
            </button>
         </div>
      </header>

      {!previewMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* Post Type Selector */}
            <section className="p-8 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
               <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">Transmission Category</h2>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {POST_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setPostType(type.id)}
                      className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                        postType === type.id
                        ? 'bg-white/10 border-white/20 text-white'
                        : 'bg-white/2 border-white/5 text-white/40 hover:border-white/10'
                      }`}
                    >
                       <type.icon size={20} className={postType === type.id ? type.color : ''} />
                       <span className="text-[8px] font-black uppercase tracking-widest">{type.label}</span>
                    </button>
                  ))}
               </div>
            </section>

            {/* Content Editor */}
            <section className="p-8 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter transmission title..."
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-nova-cyan/50 transition-all placeholder:text-white/10"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Intel Content</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe your research or update..."
                    rows={8}
                    className="w-full bg-black/40 border border-white/5 rounded-[2rem] px-6 py-6 text-sm focus:outline-none focus:border-nova-cyan/50 transition-all placeholder:text-white/10 resize-none"
                  />
               </div>
            </section>

            {/* Media Upload */}
            <section className="p-8 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
               <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">Visual & Data Logs</h2>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {media.map((file, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl border border-white/10 bg-white/5 overflow-hidden group">
                       <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                       <button
                         onClick={() => removeMedia(i)}
                         className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                          <X size={12} />
                       </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-2xl border border-dashed border-white/10 bg-white/[0.02] hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group">
                     <input type="file" multiple className="hidden" onChange={handleMediaUpload} />
                     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:text-nova-cyan transition-colors">
                        <Plus size={20} />
                     </div>
                     <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Attach Media</span>
                  </label>
               </div>
            </section>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-8">
             <section className="p-8 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-8">
                   <Settings size={16} className="text-nova-cyan" />
                   <h2 className="text-[10px] font-black uppercase tracking-widest">Protocol Settings</h2>
                </div>
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Visible to Public</span>
                      <div className="w-10 h-5 rounded-full bg-nova-cyan/20 p-1 flex justify-end cursor-pointer">
                         <div className="w-3 h-3 rounded-full bg-nova-cyan" />
                      </div>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Allow Appreciations</span>
                      <div className="w-10 h-5 rounded-full bg-nova-cyan/20 p-1 flex justify-end cursor-pointer">
                         <div className="w-3 h-3 rounded-full bg-nova-cyan" />
                      </div>
                   </div>
                   <div className="pt-6 border-t border-white/5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block mb-3">Tags</label>
                      <input
                        type="text"
                        placeholder="Add tag..."
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-[10px] focus:outline-none focus:border-nova-cyan/30"
                      />
                   </div>
                </div>
             </section>

             <div className="p-8 rounded-[3rem] bg-gradient-to-br from-nova-cyan/10 to-nova-purple/10 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-white mb-2">Notice</p>
                <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-widest">
                   All transmissions are reviewed by ecosystem moderators before public release.
                </p>
             </div>
          </div>
        </div>
      ) : (
        /* Preview Mode Mock */
        <div className="p-20 rounded-[3rem] border border-white/5 bg-white/[0.01] text-center">
           <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">Simulation Mode Active</p>
        </div>
      )}
    </div>
  );
}
