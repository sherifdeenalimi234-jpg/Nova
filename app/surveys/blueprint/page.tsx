"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Target,
  Layout,
  Users,
  Eye,
  Settings2,
  Clock,
  Briefcase,
  Tags,
  Globe2,
  Calendar,
  FileText,
  Info,
  Loader2,
  ChevronRight,
  Lock,
  Globe,
  ShieldAlert,
  Search,
  Sparkles
} from 'lucide-react';
import { createSurveyWorkspace } from '@/lib/actions/surveys';
import { getCreatorProjects } from '@/lib/actions/projects';

const SURVEY_MODES = [
  'Standard Survey',
  'Conversational Survey',
  'Live Survey',
  'Offline Survey',
  'Assessment & Quiz',
  'Interview Mode',
  'Research Study',
  'Community Poll',
  'Longitudinal Study'
];

const VISIBILITY_OPTIONS = [
  { id: 'Private', label: 'Private', icon: Lock, desc: 'Only you can access' },
  { id: 'Public', label: 'Public', icon: Globe, desc: 'Open to everyone' },
  { id: 'Invite Only', label: 'Invite Only', icon: ShieldAlert, desc: 'Restricted access' }
];

export default function SurveyBlueprint() {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    research_objective: '',
    project_id: '',
    survey_mode: 'Standard Survey',
    target_audience: '',
    target_responses: '',
    visibility: 'Private',
    // Optional
    estimated_duration: '',
    research_category: '',
    tags: '',
    language: 'English',
    research_timeline: '',
    research_notes: ''
  });

  useEffect(() => {
    async function loadProjects() {
      const res = await getCreatorProjects();
      if (res.data) setProjects(res.data);
      setLoadingProjects(false);
    }
    loadProjects();
  }, []);

  const selectedProject = projects.find(p => p.id === formData.project_id);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    // Basic validation
    const required = ['title', 'research_objective', 'project_id', 'survey_mode', 'target_audience', 'target_responses', 'visibility'];
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        alert(`${field.replace('_', ' ')} is required.`);
        return;
      }
    }

    setIsInitializing(true);

    const result = await createSurveyWorkspace({
      ...formData,
      project_id: formData.project_id || null,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
    });

    if (result.success) {
      router.push(`/creator/surveys/${result.id}`);
    } else {
      alert("Workspace creation failed: " + result.error);
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-nova-purple/30 pb-32 md:pb-0">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-nova-purple/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-nova-cyan/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <header className="mb-10 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-nova-purple/20 flex items-center justify-center text-nova-purple border border-nova-purple/30">
                  <Layout size={20} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-nova-purple">Phase 1A: Initialization</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight uppercase">Survey Blueprint</h1>
            <p className="text-white/40 text-sm lg:text-base max-w-2xl font-medium">
              Create the foundation of your research project before entering the Survey Workspace.
            </p>
          </motion.div>
        </header>

        {/* Desktop Layout: Modern Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Main Form (Span 8) */}
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 lg:p-10 backdrop-blur-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Required Fields */}
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-nova-cyan">1. Survey Name <span className="text-red-500">*</span></label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. AI-Driven User Experience Analysis"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-nova-cyan/50 focus:ring-0 transition-all placeholder:text-white/10"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-nova-cyan">2. Research Objective <span className="text-red-500">*</span></label>
                  <textarea
                    name="research_objective"
                    value={formData.research_objective}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Clearly define the primary goal of this research node..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-nova-cyan/50 focus:ring-0 transition-all placeholder:text-white/10 resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-nova-cyan">3. Linked Project <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <select
                      name="project_id"
                      value={formData.project_id}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm appearance-none focus:border-nova-cyan/50 focus:ring-0 transition-all"
                    >
                      <option value="">Select Project...</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-nova-cyan">4. Survey Mode <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <select
                      name="survey_mode"
                      value={formData.survey_mode}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm appearance-none focus:border-nova-cyan/50 focus:ring-0 transition-all"
                    >
                      {SURVEY_MODES.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-nova-cyan">5. Target Audience <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input
                      name="target_audience"
                      value={formData.target_audience}
                      onChange={handleInputChange}
                      placeholder="e.g. Gen-Z Tech Enthusiasts"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-nova-cyan/50 focus:ring-0 transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-nova-cyan">6. Target Responses <span className="text-red-500">*</span></label>
                  <input
                    name="target_responses"
                    type="number"
                    value={formData.target_responses}
                    onChange={handleInputChange}
                    placeholder="e.g. 500"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-nova-cyan/50 focus:ring-0 transition-all placeholder:text-white/10"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-nova-cyan">7. Visibility <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {VISIBILITY_OPTIONS.map(opt => {
                      const Icon = opt.icon;
                      const isActive = formData.visibility === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setFormData(prev => ({ ...prev, visibility: opt.id }))}
                          className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all ${
                            isActive
                            ? 'bg-nova-cyan/10 border-nova-cyan text-nova-cyan shadow-[0_0_20px_rgba(0,242,255,0.15)]'
                            : 'bg-black/40 border-white/5 text-white/40 hover:border-white/20'
                          }`}
                        >
                          <Icon size={20} className={isActive ? 'text-nova-cyan' : 'text-white/20'} />
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest">{opt.label}</span>
                            <span className="text-[8px] opacity-60 lowercase font-medium">{opt.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div className="md:col-span-2 py-4 flex items-center gap-4">
                   <div className="h-px flex-1 bg-white/5" />
                   <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20">Optional Parameters</span>
                   <div className="h-px flex-1 bg-white/5" />
                </div>

                {/* Optional Fields */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Estimated Duration</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input
                      name="estimated_duration"
                      value={formData.estimated_duration}
                      onChange={handleInputChange}
                      placeholder="e.g. 5-10 Minutes"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-white/30 focus:ring-0 transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Research Category</label>
                  <input
                    name="research_category"
                    value={formData.research_category}
                    onChange={handleInputChange}
                    placeholder="e.g. Technology"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-white/30 focus:ring-0 transition-all placeholder:text-white/10"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Tags (comma separated)</label>
                  <div className="relative">
                    <Tags className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="e.g. AI, UX, Blockchain"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-white/30 focus:ring-0 transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Language</label>
                  <div className="relative">
                    <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      placeholder="English"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-white/30 focus:ring-0 transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Research Timeline</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input
                      name="research_timeline"
                      value={formData.research_timeline}
                      onChange={handleInputChange}
                      placeholder="e.g. June 2024 - August 2024"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-white/30 focus:ring-0 transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Research Notes</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-5 text-white/20" size={16} />
                    <textarea
                      name="research_notes"
                      value={formData.research_notes}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Any additional context or internal notes..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-white/30 focus:ring-0 transition-all placeholder:text-white/10 resize-none"
                    />
                  </div>
                </div>

              </div>
            </section>
          </div>

          {/* Side Panels (Span 4) */}
          <div className="lg:col-span-4 space-y-8">

            {/* Project Information Panel */}
            <aside className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-nova-cyan/10 flex items-center justify-center text-nova-cyan">
                    <Briefcase size={16} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Project Context</h3>
               </div>

               {selectedProject ? (
                 <div className="space-y-4">
                    <div className="aspect-video rounded-xl bg-white/5 border border-white/10 overflow-hidden relative">
                       {selectedProject.thumbnail_url ? (
                         <img src={selectedProject.thumbnail_url} alt={selectedProject.title} className="w-full h-full object-cover" />
                       ) : (
                         <div className="absolute inset-0 flex items-center justify-center text-white/10">
                           <Layout size={32} />
                         </div>
                       )}
                    </div>
                    <div>
                       <h4 className="text-sm font-bold mb-1">{selectedProject.title}</h4>
                       <p className="text-[10px] text-white/40 line-clamp-2">{selectedProject.description}</p>
                    </div>
                    <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                       <div>
                          <p className="text-[8px] uppercase tracking-widest text-white/20 mb-1">Status</p>
                          <span className="text-[9px] font-bold text-nova-green">ACTIVE NODE</span>
                       </div>
                       <div>
                          <p className="text-[8px] uppercase tracking-widest text-white/20 mb-1">Connected</p>
                          <span className="text-[9px] font-bold">2 MODULES</span>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="py-12 flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 rounded-full border border-dashed border-white/10 flex items-center justify-center text-white/10">
                       <Briefcase size={20} />
                    </div>
                    <p className="text-[9px] text-white/20 uppercase tracking-widest leading-relaxed">
                      Select a project to view <br /> connected research context
                    </p>
                 </div>
               )}
            </aside>

            {/* Workspace Preview Panel */}
            <aside className="bg-gradient-to-br from-nova-purple/10 to-transparent border border-nova-purple/20 rounded-[2rem] p-8 space-y-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles size={48} className="text-nova-purple" />
               </div>

               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-nova-purple/20 flex items-center justify-center text-nova-purple">
                    <Layout size={16} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Workspace Preview</h3>
               </div>

               <ul className="space-y-4">
                  {[
                    { label: 'Logic Node Builder', status: 'LOCKED', icon: Settings2 },
                    { label: 'Intelligence Architect', status: 'LOCKED', icon: Target },
                    { label: 'Data Stream Hub', status: 'LOCKED', icon: Search },
                    { label: 'Security Protocols', status: 'LOCKED', icon: ShieldAlert }
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-4">
                       <div className="flex items-center gap-3">
                          <item.icon size={14} className="text-white/20" />
                          <span className="text-[10px] font-medium text-white/60">{item.label}</span>
                       </div>
                       <span className="text-[8px] font-black text-white/20 px-2 py-0.5 rounded-full border border-white/5">{item.status}</span>
                    </li>
                  ))}
               </ul>

               <div className="p-4 rounded-xl bg-nova-purple/5 border border-nova-purple/10">
                  <p className="text-[9px] text-nova-purple/80 leading-relaxed uppercase tracking-tighter">
                    Ready to initialize research environment? Complete required blueprint fields.
                  </p>
               </div>
            </aside>

          </div>

        </div>

        {/* Desktop Create Workspace Footer */}
        <footer className="mt-16 hidden lg:flex justify-end pt-10 border-t border-white/5">
           <button
             onClick={handleCreate}
             disabled={isInitializing}
             className="px-12 py-5 rounded-2xl bg-nova-purple text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-[0_10px_40px_rgba(188,19,254,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-4 disabled:opacity-50"
           >
              {isInitializing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {isInitializing ? 'INITIALIZING...' : 'Create Workspace'}
           </button>
        </footer>

      </div>

      {/* Mobile Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-2xl border-t border-white/10 z-[60] lg:hidden safe-area-bottom">
         <button
            onClick={handleCreate}
            disabled={isInitializing}
            className="w-full py-4 rounded-2xl bg-nova-purple text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(188,19,254,0.3)] flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
         >
            {isInitializing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Create Workspace
         </button>
      </div>

      {/* Full Screen Overlay for Initialization */}
      <AnimatePresence>
        {isInitializing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-12"
          >
             <motion.div
               animate={{ rotate: 360 }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               className="w-24 h-24 rounded-full border-2 border-nova-purple/20 flex items-center justify-center mb-10 relative"
             >
                <div className="absolute inset-0 rounded-full border-2 border-nova-purple border-t-transparent" />
                <Target size={32} className="text-nova-purple -rotate-[360deg]" />
             </motion.div>
             <div className="space-y-4">
                <h3 className="text-2xl font-black uppercase tracking-[0.3em] text-nova-cyan">Establishing Node</h3>
                <p className="text-white/30 text-[9px] uppercase tracking-[0.5em] animate-pulse">Syncing Blueprint Metadata...</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
