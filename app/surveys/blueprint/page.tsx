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
  Plus,
  ShieldAlert
} from 'lucide-react';
import { createSurveyWorkspace } from '@/lib/actions/surveys';
import { getCreatorProjects } from '@/lib/actions/projects';

const AUDIENCE_OPTIONS = ['Students', 'Educators', 'Researchers', 'Professionals', 'General Public', 'Custom'];
const RESPONSE_OPTIONS = ['10', '25', '50', '100', '250', '500', '1000', 'Custom'];
const DURATION_OPTIONS = ['Under 2 Minutes', '2–5 Minutes', '5–10 Minutes', '10+ Minutes'];
const VISIBILITY_OPTIONS = [
  { id: 'Private', label: 'Private', icon: Lock },
  { id: 'Public', label: 'Public', icon: Globe },
  { id: 'Invite Only', label: 'Invite Only', icon: ShieldAlert }
];

export default function SurveyBlueprint() {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(false);
  const [step, setStep] = useState('initializing');

  // Form State
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [audience, setAudience] = useState('General Public');
  const [customAudience, setCustomAudience] = useState('');

  const [targetResponses, setTargetResponses] = useState('100');
  const [customResponses, setCustomResponses] = useState('');

  const [duration, setDuration] = useState('2–5 Minutes');
  const [visibility, setVisibility] = useState('Private');

  useEffect(() => {
    async function loadProjects() {
      const res = await getCreatorProjects();
      if (res.data) setProjects(res.data);
      setLoadingProjects(false);
    }
    loadProjects();
  }, []);

  const handleCreate = async () => {
    if (!name || !objective) return alert("Survey Name and Research Objective are required.");

    setIsInitializing(true);
    setStep('initializing');

    const result = await createSurveyWorkspace({
      title: name,
      research_objective: objective,
      project_id: selectedProject?.id || null,
      target_audience: audience === 'Custom' ? customAudience : audience,
      target_responses: targetResponses === 'Custom' ? customResponses : targetResponses,
      estimated_duration: duration,
      visibility: visibility
    });

    if (result.success) {
      setStep('redirecting');
      setTimeout(() => {
        router.push(`/surveys/${result.id}/dashboard`);
      }, 1000);
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

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-20">
        <header className="mb-12">
          <h1 className="text-4xl font-black tracking-tight mb-3">Create Research Survey</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            Initialize your survey workspace before building questions, settings, logic, and publishing.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Survey Name */}
          <div className="md:col-span-2 space-y-3">
            <label className="text-xs font-bold text-white/80 uppercase tracking-widest">Survey Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-nova-purple/50 transition-all"
              placeholder="Enter survey title..."
            />
          </div>

          {/* Research Objective */}
          <div className="md:col-span-2 space-y-3">
            <label className="text-xs font-bold text-white/80 uppercase tracking-widest">Research Objective</label>
            <textarea
              rows={4}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-nova-purple/50 transition-all resize-none"
              placeholder="Describe the overview and purpose of this survey..."
            />
          </div>

          {/* Linked Project */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/80 uppercase tracking-widest">Linked Project</label>
            <select
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-nova-purple/50 transition-all appearance-none"
              onChange={(e) => {
                const proj = projects.find(p => p.id === e.target.value);
                setSelectedProject(proj || null);
              }}
              value={selectedProject?.id || ""}
            >
              <option value="" className="bg-[#050505]">No Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-[#050505]">{p.title}</option>
              ))}
            </select>
          </div>

          {/* Target Audience */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/80 uppercase tracking-widest">Target Audience</label>
            <select
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-nova-purple/50 transition-all appearance-none"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            >
              {AUDIENCE_OPTIONS.map(opt => (
                <option key={opt} value={opt} className="bg-[#050505]">{opt}</option>
              ))}
            </select>
            {audience === 'Custom' && (
              <input
                value={customAudience}
                onChange={(e) => setCustomAudience(e.target.value)}
                className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-nova-purple/50"
                placeholder="Specify target audience..."
              />
            )}
          </div>

          {/* Target Responses */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/80 uppercase tracking-widest">Target Responses</label>
            <select
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-nova-purple/50 transition-all appearance-none"
              value={targetResponses}
              onChange={(e) => setTargetResponses(e.target.value)}
            >
              {RESPONSE_OPTIONS.map(opt => (
                <option key={opt} value={opt} className="bg-[#050505]">{opt}</option>
              ))}
            </select>
            {targetResponses === 'Custom' && (
              <input
                type="number"
                value={customResponses}
                onChange={(e) => setCustomResponses(e.target.value)}
                className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-nova-purple/50"
                placeholder="Enter response count..."
              />
            )}
          </div>

          {/* Estimated Duration */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/80 uppercase tracking-widest">Estimated Duration</label>
            <select
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-nova-purple/50 transition-all appearance-none"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              {DURATION_OPTIONS.map(opt => (
                <option key={opt} value={opt} className="bg-[#050505]">{opt}</option>
              ))}
            </select>
          </div>

          {/* Visibility */}
          <div className="md:col-span-2 space-y-3">
            <label className="text-xs font-bold text-white/80 uppercase tracking-widest">Visibility</label>
            <div className="grid grid-cols-3 gap-3">
              {VISIBILITY_OPTIONS.map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setVisibility(opt.id)}
                    className={`py-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                      visibility === opt.id
                      ? 'bg-nova-purple/20 border-nova-purple text-white'
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
        </div>

        {/* Action Button */}
        <div className="mt-16">
          <button
            onClick={handleCreate}
            disabled={isInitializing}
            className="w-full py-5 rounded-2xl bg-nova-purple text-white text-xs font-black uppercase tracking-[0.3em] shadow-[0_10px_40px_rgba(188,19,254,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isInitializing ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
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
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-12"
          >
             <div className="w-24 h-24 rounded-full border-2 border-nova-purple/20 flex items-center justify-center mb-10 relative">
                <div className="absolute inset-0 rounded-full border-2 border-nova-purple border-t-transparent animate-spin" />
                <Target size={32} className="text-nova-purple" />
             </div>
             <div className="space-y-4">
                <h3 className="text-2xl font-black uppercase tracking-[0.2em]">
                  {step === 'initializing' && 'Initializing Workspace'}
                  {step === 'redirecting' && 'Redirection Active'}
                </h3>
                <p className="text-white/30 text-[10px] uppercase tracking-[0.5em] animate-pulse">Establishing Research Node</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
