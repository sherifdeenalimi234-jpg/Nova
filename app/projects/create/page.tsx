"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Rocket,
  Eye,
  ArrowRight,
  Check,
  Image as ImageIcon,
  Loader2,
  Lock,
  Globe
} from 'lucide-react';
import ProjectTopBar from '@/components/projects/ProjectTopBar';
import { createProject } from '@/lib/actions/projects';
import { uploadFile } from '@/lib/supabase/storage';

export const dynamic = "force-dynamic";

export default function CreateProjectPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    short_description: '',
    visibility: 'Public' as 'Public' | 'Private',
    project_type: 'Live Project' as 'Live Project' | 'Showcase Project',
    cover_image: ''
  });
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleTypeSelect = (type: 'Live Project' | 'Showcase Project') => {
    setFormData({ ...formData, project_type: type });
    setStep(2);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const publicUrl = await uploadFile(file, 'projects');
      setFormData({ ...formData, cover_image: publicUrl });
    } catch (error: any) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.short_description || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const result = await createProject({
      ...formData,
      full_description: formData.short_description, // For now reuse
      visibility: formData.visibility === 'Public' ? 'Public' : 'Private',
      tags: []
    });

    if (result.error) {
      alert(result.error);
      setLoading(false);
    } else {
      // PHASE 1.2A/C: Redirect directly to the Project Website Home Page
      router.push(`/projects/${result.data.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-10">
      <ProjectTopBar title="Create Node" />

      <main className="pt-24 px-6 max-w-lg mx-auto">
        {/* Step Progress */}
        <div className="flex gap-2 mb-10">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-nova-cyan' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Type Selection */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Project Type</h2>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">What type of innovation are you building?</p>
            </div>

            <div className="grid gap-4">
              <button
                onClick={() => handleTypeSelect('Live Project')}
                className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-6 text-left hover:border-nova-cyan/50 hover:bg-nova-cyan/5 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-nova-cyan/10 flex items-center justify-center text-nova-cyan group-hover:scale-110 transition-transform">
                  <Rocket size={24} />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-widest text-sm mb-1">Live Project</h3>
                  <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest">Ongoing production with roadmap and workspace.</p>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect('Showcase Project')}
                className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-6 text-left hover:border-nova-cyan/50 hover:bg-nova-cyan/5 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-nova-purple/10 flex items-center justify-center text-nova-purple group-hover:scale-110 transition-transform">
                  <Eye size={24} />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-widest text-sm mb-1">Showcase Project</h3>
                  <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest">A completed or portfolio initiative for discovery.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Core Details</h2>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Identify your innovation node</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Project Name</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-nova-cyan transition-all outline-none"
                  placeholder="e.g. Nexus Protocol Alpha"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-nova-cyan transition-all outline-none"
                  placeholder="e.g. Blockchain, AI, Hardware"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Description</label>
                <textarea
                  value={formData.short_description}
                  onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-nova-cyan transition-all outline-none min-h-[120px] resize-none"
                  placeholder="What is this project about?"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Visibility</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'Public', icon: Globe },
                    { id: 'Private', icon: Lock }
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setFormData({...formData, visibility: v.id as any})}
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
                        formData.visibility === v.id
                        ? 'bg-nova-cyan/10 border-nova-cyan text-nova-cyan'
                        : 'bg-white/5 border-white/10 text-white/40'
                      }`}
                    >
                      <v.icon size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{v.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!formData.title || !formData.short_description || !formData.category}
                className="w-full py-5 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-nova-cyan transition-all disabled:opacity-50"
              >
                Next Step <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Cover Image */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Visual Identity</h2>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Optional project cover image</p>
            </div>

            <div className="space-y-8">
              <div className="aspect-video w-full rounded-3xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center overflow-hidden group relative">
                {formData.cover_image ? (
                  <>
                    <img src={formData.cover_image} className="w-full h-full object-cover" alt="Cover preview" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <label className="px-6 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest cursor-pointer">
                        Change Image
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                       </label>
                    </div>
                  </>
                ) : (
                  <>
                    {uploading ? (
                      <Loader2 className="animate-spin text-nova-cyan" size={32} />
                    ) : (
                      <>
                        <ImageIcon size={32} className="text-white/20 mb-4" />
                        <label className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/10 transition-all">
                          Upload Cover
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-5 rounded-2xl border border-white/10 text-white/40 text-xs font-black uppercase tracking-widest"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-[2] py-5 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-nova-cyan transition-all"
                >
                  Final Review <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Final Review */}
        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Final Review</h2>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Verify node parameters before launch</p>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Project Name</span>
                <span className="text-xs font-black">{formData.title}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Type</span>
                <span className="text-xs font-black text-nova-cyan uppercase">{formData.project_type}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Visibility</span>
                <span className="text-xs font-black">{formData.visibility}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Category</span>
                <span className="text-xs font-black">{formData.category}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-5 rounded-2xl border border-white/10 text-white/40 text-xs font-black uppercase tracking-widest"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[2] py-5 rounded-2xl bg-nova-cyan text-black text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                Create Project
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
