"use client";

import React, { useState } from 'react';
import { createProject } from '@/lib/actions/projects';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  Cpu,
  Users,
  Zap,
  Layout,
  Globe,
  Lock,
  Users2,
  ChevronDown,
  X,
  Camera,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadFile } from '@/lib/supabase/storage';

const CATEGORIES = [
  'Research',
  'Software',
  'Hardware',
  'AI/ML',
  'Biotech',
  'Energy',
  'Space',
  'Sustainability',
  'Web3',
  'Other'
];

const VISIBILITY_OPTIONS = [
  { value: 'Public', label: 'Public', description: 'Visible to everyone in the ecosystem', icon: Globe },
  { value: 'Team Only', label: 'Team Only', description: 'Only visible to project members', icon: Users2 },
  { value: 'Private', label: 'Private', description: 'Only visible to you', icon: Lock },
];

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [visibility, setVisibility] = useState<'Public' | 'Team Only' | 'Private'>('Public');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<{ cover: boolean; banner: boolean }>({ cover: false, banner: false });

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(prev => ({ ...prev, [type]: true }));
      const url = await uploadFile(file, 'projects');
      if (type === 'cover') setCoverImage(url);
      else setBannerImage(url);
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async () => {
    if (!title || !shortDescription || !fullDescription) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: submitError } = await createProject({
      title,
      short_description: shortDescription,
      full_description: fullDescription,
      category,
      visibility,
      tags,
      cover_image: coverImage || undefined,
      banner_image: bannerImage || undefined
    });

    setLoading(false);
    if (submitError) {
      setError(submitError);
    } else {
      router.push('/creator/projects');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
         <div>
            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Initialize Project</h1>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Register a new innovation node in your portfolio</p>
         </div>
         <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={loading || isUploading.cover || isUploading.banner}
              className="w-full md:w-auto px-8 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-nova-cyan transition-all disabled:opacity-50"
            >
               {loading ? 'Deploying...' : 'Deploy Project'}
            </button>
         </div>
      </header>

      {error && (
        <div className="mx-4 md:mx-0 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 px-4 md:px-0">
        <div className="lg:col-span-2 space-y-10">
          {/* Basic Info */}
          <section className="p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-8">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Project Identity *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Project Title"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 md:px-8 py-4 md:py-5 text-lg font-bold focus:outline-none focus:border-nova-cyan/50 transition-all placeholder:text-white/10"
                />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Category</label>
                   <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full appearance-none bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-nova-cyan/50 transition-all"
                      >
                         {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Visibility</label>
                   <div className="relative">
                      <select
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value as any)}
                        className="w-full appearance-none bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-nova-cyan/50 transition-all"
                      >
                         {VISIBILITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                   </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Short Abstract (Elevator Pitch) *</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="One sentence summary of the project..."
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 md:px-8 py-4 md:py-5 text-sm focus:outline-none focus:border-nova-cyan/50 transition-all placeholder:text-white/10"
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Technical Documentation *</label>
                <textarea
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Describe the core purpose, technical framework, and intended impact..."
                  rows={8}
                  className="w-full bg-black/40 border border-white/5 rounded-[1.5rem] md:rounded-[2rem] px-6 md:px-8 py-5 md:py-6 text-sm focus:outline-none focus:border-nova-cyan/50 transition-all placeholder:text-white/10 resize-none"
                />
             </div>
          </section>

          {/* Media Showcase */}
          <section className="p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
             <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40">Visual Assets</h2>
             </div>

             <div className="space-y-8">
                {/* Banner Upload */}
                <div className="space-y-4">
                   <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">Project Banner</label>
                   <div
                     className="relative aspect-[3/1] rounded-3xl border border-dashed border-white/10 bg-white/[0.01] overflow-hidden group transition-all"
                   >
                      {bannerImage ? (
                        <>
                          <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                             <label className="cursor-pointer p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all">
                                <Upload size={20} />
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
                             </label>
                             <button onClick={() => setBannerImage(null)} className="p-4 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all">
                                <X size={20} />
                             </button>
                          </div>
                        </>
                      ) : (
                        <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center gap-3 group-hover:bg-white/[0.02] transition-all">
                           <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-nova-cyan transition-colors">
                              {isUploading.banner ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-nova-cyan border-t-transparent" /> : <ImageIcon size={24} />}
                           </div>
                           <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Upload Banner Image (1200x400)</p>
                           <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
                        </label>
                      )}
                   </div>
                </div>

                {/* Cover Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">Project Thumbnail</label>
                      <div className="aspect-square rounded-3xl border border-dashed border-white/10 bg-white/[0.01] relative overflow-hidden group">
                         {coverImage ? (
                           <>
                             <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <label className="cursor-pointer p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all">
                                   <Upload size={20} />
                                   <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />
                                </label>
                                <button onClick={() => setCoverImage(null)} className="p-4 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all">
                                   <X size={20} />
                                </button>
                             </div>
                           </>
                         ) : (
                           <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center gap-3 group-hover:bg-white/[0.02] transition-all">
                              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-nova-cyan transition-colors">
                                 {isUploading.cover ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-nova-cyan border-t-transparent" /> : <Camera size={24} />}
                              </div>
                              <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Upload Cover (Square)</p>
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />
                           </label>
                         )}
                      </div>
                   </div>
                   <div className="flex flex-col justify-end pb-4">
                      <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] leading-relaxed">
                         Upload high-quality visual representation of your project. The banner will be shown on the workspace header, and the thumbnail in the project directory.
                      </p>
                   </div>
                </div>
             </div>
          </section>

          {/* Tags */}
          <section className="p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
             <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-8 px-2">Project Tags</h2>
             <div className="flex flex-wrap gap-3 mb-8">
                <AnimatePresence>
                   {tags.map((tag) => (
                     <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        key={tag}
                        className="px-5 py-2.5 rounded-xl bg-nova-cyan/5 border border-nova-cyan/20 flex items-center gap-3 group"
                     >
                        <span className="text-[10px] font-black uppercase tracking-widest text-nova-cyan">{tag}</span>
                        <button onClick={() => removeTag(tag)} className="text-white/20 hover:text-white transition-colors">
                           <X size={12} />
                        </button>
                     </motion.div>
                   ))}
                </AnimatePresence>
             </div>
             <div className="flex gap-4">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add technology, field, or keyword..."
                  className="flex-1 bg-black/40 border border-white/5 rounded-xl px-6 py-4 text-xs focus:outline-none focus:border-nova-cyan/30"
                />
                <button
                  onClick={addTag}
                  className="px-6 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10"
                >
                   Add
                </button>
             </div>
          </section>
        </div>

        <div className="space-y-8">
           {/* Guidelines */}
           <section className="p-10 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-10">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-2xl bg-nova-cyan/10 flex items-center justify-center border border-nova-cyan/20">
                    <Zap size={18} className="text-nova-cyan" />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Initialization Rules</h4>
              </div>

              <ul className="space-y-6">
                 {[
                   { icon: Layers, text: "Provide clear technical documentation for potential collaborators." },
                   { icon: Layout, text: "High-quality visual assets increase node authority." },
                   { icon: Cpu, text: "Tag your tech stack accurately to appear in filtered searches." },
                   { icon: Users, text: "Visibility settings can be adjusted at any time in workspace settings." }
                 ].map((rule, i) => (
                   <li key={i} className="flex gap-4">
                      <rule.icon size={14} className="text-white/20 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-widest">{rule.text}</p>
                   </li>
                 ))}
              </ul>
           </section>

           <div className="p-10 rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-br from-nova-purple/10 to-nova-cyan/10 border border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">Ecosystem Impact</h4>
              <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-widest">
                 Initializing a project consumes Node Credits but increases your long-term reputation within the innovation ecosystem.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
