"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Target,
  Clock,
  Eye,
  Settings2,
  Check,
  X,
  Briefcase,
  Users,
  Info,
  Loader2,
  Lock,
  Globe,
  Building,
  Plus
} from 'lucide-react';
import { createBlueprint } from '@/lib/actions/blueprint';

const AUDIENCE_OPTIONS = ['Students', 'Teachers', 'Parents', 'Researchers', 'Employees', 'Public', 'Community', 'Other'];
const RESPONSE_OPTIONS = ['25', '50', '100', '250', '500', '1000', 'Custom'];
const DURATION_OPTIONS = ['1–3 Minutes', '3–5 Minutes', '5–10 Minutes', '10+ Minutes'];
const VISIBILITY_OPTIONS = [
  { id: 'private', label: 'Private', icon: Lock },
  { id: 'organization', label: 'Organization', icon: Building },
  { id: 'public', label: 'Public', icon: Globe }
];

export default function SurveyBlueprint() {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(false);
  const [step, setStep] = useState('initializing'); // initializing, creating, redirecting

  // Basic Info
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [linkedProject, setLinkedProject] = useState('Independent Survey');

  // Audience & Goals
  const [selectedAudience, setSelectedAudience] = useState<string[]>([]);
  const [targetResponses, setTargetResponses] = useState('100');
  const [customResponses, setCustomResponses] = useState('');

  // Configuration
  const [duration, setDuration] = useState('3–5 Minutes');
  const [visibility, setVisibility] = useState('public');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [collectIdentity, setCollectIdentity] = useState(false);

  // Advanced
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoClose, setAutoClose] = useState(true);

  const toggleAudience = (item: string) => {
    setSelectedAudience(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const handleCreate = async () => {
    if (!name || !objective) return alert("System requires Survey Name and Objective.");

    setIsInitializing(true);
    setStep('initializing');

    await new Promise(r => setTimeout(r, 800));
    setStep('creating');

    const result = await createBlueprint({
      name,
      objective,
      linkedProject,
      audience: selectedAudience,
      targetResponses: targetResponses === 'Custom' ? parseInt(customResponses) : parseInt(targetResponses),
      duration,
      visibility,
      isAnonymous,
      collectIdentity,
      advanced: { autoClose }
    });

    if (result.success) {
      setStep('redirecting');
      await new Promise(r => setTimeout(r, 600));
      router.push(`/surveys/${result.id}/dashboard`);
    } else {
      alert("Workspace creation failed: " + result.error);
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-nova-purple/30 pb-40">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-nova-purple/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-nova-cyan/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-20">
        <header className="mb-12">
          <h1 className="text-4xl font-black tracking-tight mb-3">Survey Blueprint</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            Define the purpose, audience, and goals of your survey before entering the workspace.
          </p>
        </header>

        <div className="space-y-16">
          {/* Section: Basic Info */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 opacity-40">
               <Info size={16} />
               <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Basic Information</h2>
            </div>

            <div className="space-y-6">
               <div className="space-y-3">
                  <label className="text-xs font-bold text-white/80">Survey Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-nova-purple/50 transition-all"
                    placeholder="E.g. Student Learning Experience Survey"
                  />
               </div>

               <div className="space-y-3">
                  <label className="text-xs font-bold text-white/80">Objective Overview</label>
                  <textarea
                    rows={4}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-nova-purple/50 transition-all resize-none"
                    placeholder="Describe the purpose and objectives of this survey..."
                  />
               </div>

               <div className="space-y-3">
                  <label className="text-xs font-bold text-white/80">Linked Project</label>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-nova-cyan/30 transition-all cursor-pointer">
                     <div className="flex items-center gap-3">
                        <Briefcase size={18} className="text-nova-cyan" />
                        <span className="text-sm font-medium">{linkedProject}</span>
                     </div>
                     <ChevronRight size={16} className="text-white/20" />
                  </div>
               </div>
            </div>
          </section>

          {/* Section: Audience & Goals */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 opacity-40">
               <Users size={16} />
               <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Audience & Goals</h2>
            </div>

            <div className="space-y-8">
               <div className="space-y-4">
                  <label className="text-xs font-bold text-white/80">Target Audience</label>
                  <div className="grid grid-cols-2 gap-3">
                    {AUDIENCE_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => toggleAudience(opt)}
                        className={`py-4 rounded-2xl border text-[11px] font-bold uppercase tracking-widest transition-all ${
                          selectedAudience.includes(opt)
                          ? 'bg-nova-purple border-nova-purple text-white'
                          : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-xs font-bold text-white/80">Target Responses</label>
                  <div className="grid grid-cols-3 gap-3">
                    {RESPONSE_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setTargetResponses(opt)}
                        className={`py-4 rounded-xl border text-[11px] font-black transition-all ${
                          targetResponses === opt
                          ? 'bg-nova-cyan border-nova-cyan text-black'
                          : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {targetResponses === 'Custom' && (
                    <motion.input
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="number"
                      placeholder="Enter custom response count"
                      value={customResponses}
                      onChange={(e) => setCustomResponses(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nova-cyan/50"
                    />
                  )}
               </div>
            </div>
          </section>

          {/* Section: Configuration */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 opacity-40">
               <Settings2 size={16} />
               <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Configuration</h2>
            </div>

            <div className="space-y-8">
               <div className="space-y-4">
                  <label className="text-xs font-bold text-white/80 flex items-center gap-2">
                    <Clock size={14} /> Estimated Duration
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {DURATION_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setDuration(opt)}
                        className={`py-4 rounded-2xl border text-[11px] font-bold transition-all ${
                          duration === opt
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-xs font-bold text-white/80 flex items-center gap-2">
                    <Eye size={14} /> Visibility
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {VISIBILITY_OPTIONS.map(opt => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setVisibility(opt.id)}
                          className={`py-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                            visibility === opt.id
                            ? 'bg-nova-purple border-nova-purple text-white'
                            : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                          }`}
                        >
                          <Icon size={18} />
                          <span className="text-[10px] font-black uppercase tracking-tighter">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
               </div>

               {/* Toggles */}
               <div className="space-y-4">
                  {[
                    { label: 'Anonymous Responses', val: isAnonymous, set: setIsAnonymous, desc: 'Do not collect node identities' },
                    { label: 'Collect Participant Identity', val: collectIdentity, set: setCollectIdentity, desc: 'Requires Google Authentication' }
                  ].map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-white/2 border border-white/5">
                       <div>
                          <div className="text-xs font-bold mb-1">{t.label}</div>
                          <div className="text-[10px] text-white/20 uppercase tracking-widest">{t.desc}</div>
                       </div>
                       <button
                        onClick={() => t.set(!t.val)}
                        className={`w-12 h-6 rounded-full transition-all relative ${t.val ? 'bg-nova-purple' : 'bg-white/10'}`}
                       >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${t.val ? 'left-7' : 'left-1'}`} />
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          </section>

          {/* Live Preview */}
          <section className="p-8 rounded-[40px] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10">
             <div className="flex items-center gap-3 mb-6 opacity-40">
                <Target size={16} />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Workspace Preview</h2>
             </div>
             <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                <div>
                   <div className="text-[9px] text-white/20 uppercase tracking-widest mb-1 font-bold">Survey Name</div>
                   <div className="text-sm font-bold truncate">{name || 'Untitled Workspace'}</div>
                </div>
                <div>
                   <div className="text-[9px] text-white/20 uppercase tracking-widest mb-1 font-bold">Audience</div>
                   <div className="text-sm font-bold">{selectedAudience.length > 0 ? selectedAudience.join(', ') : 'Ecosystem-wide'}</div>
                </div>
                <div>
                   <div className="text-[9px] text-white/20 uppercase tracking-widest mb-1 font-bold">Target Intel</div>
                   <div className="text-sm font-bold text-nova-cyan">{targetResponses === 'Custom' ? customResponses : targetResponses} Responses</div>
                </div>
                <div>
                   <div className="text-[9px] text-white/20 uppercase tracking-widest mb-1 font-bold">Linked Project</div>
                   <div className="text-sm font-bold text-nova-purple">{linkedProject}</div>
                </div>
             </div>
          </section>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 w-full z-50 p-6">
         <div className="max-w-2xl mx-auto flex gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
            >
               Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isInitializing}
              className="flex-[2] py-4 rounded-2xl bg-nova-purple text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_10px_40px_rgba(188,19,254,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
               {isInitializing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
               Create Workspace
            </button>
         </div>
      </div>

      {/* Initializing Overlay */}
      <AnimatePresence>
        {isInitializing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-center p-12"
          >
             <div className="w-20 h-20 rounded-full border-2 border-nova-purple/20 flex items-center justify-center mb-10">
                <div className="w-10 h-10 rounded-full border-2 border-nova-purple border-t-transparent animate-spin" />
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-bold uppercase tracking-[0.2em]">
                  {step === 'initializing' && 'Initializing Survey Workspace...'}
                  {step === 'creating' && 'Creating Survey Record...'}
                  {step === 'redirecting' && 'Redirecting to Dashboard...'}
                </h3>
                <p className="text-white/30 text-xs uppercase tracking-widest">Quantum synchronization in progress</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
