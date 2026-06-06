"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  AlertCircle,
  Loader2,
  Plus,
  ArrowRight,
  Settings,
  X,
  Globe,
  Lock,
  Users
} from 'lucide-react';
import { createSurvey } from '@/lib/actions/surveys';
import { getCreatorProjects } from '@/lib/actions/projects';

const AUDIENCE_OPTIONS = [
  'Students', 'Teachers', 'Parents', 'Researchers',
  'Employees', 'Public', 'Community', 'Other'
];

const RESPONSE_OPTIONS = [25, 50, 100, 250, 500, 1000, 'Custom'];

const DURATION_OPTIONS = [
  '1–3 Minutes', '3–5 Minutes', '5–10 Minutes', '10+ Minutes'
];

const VISIBILITY_OPTIONS = [
  { id: 'Private', icon: Lock },
  { id: 'Organization', icon: Users },
  { id: 'Public', icon: Globe }
];

export default function SurveyBlueprintPage() {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [targetAudience, setTargetAudience] = useState<string[]>([]);
  const [targetResponses, setTargetResponses] = useState<number | string>(100);
  const [customResponses, setCustomResponses] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('3–5 Minutes');
  const [visibility, setVisibility] = useState<'Private' | 'Organization' | 'Public'>('Private');

  // Settings State
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [collectIdentity, setCollectIdentity] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoClose, setAutoClose] = useState(false);
  const [responseLimit, setResponseLimit] = useState(0);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');

  // UI State
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [projectSearch, setProjectSearch] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      const { data } = await getCreatorProjects();
      if (data) setProjects(data);
      setLoadingProjects(false);
    }
    loadProjects();
  }, []);

  const handleAudienceToggle = (option: string) => {
    setTargetAudience(prev =>
      prev.includes(option)
        ? prev.filter(a => a !== option)
        : [...prev, option]
    );
  };

  const handleCreateWorkspace = async () => {
    if (!title) {
      setError('Survey Name is required.');
      return;
    }
    if (!description) {
      setError('Objective Overview is required.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      setSubmissionStep('Initializing Survey Workspace...');
      await new Promise(r => setTimeout(r, 800));

      setSubmissionStep('Creating Survey Record...');

      const res = await createSurvey({
        title,
        description,
        project_id: selectedProjectId,
        visibility,
        target_audience: targetAudience,
        target_responses: targetResponses === 'Custom' ? parseInt(customResponses) || 0 : Number(targetResponses),
        estimated_time: parseInt(estimatedDuration) || 5, // Simple mapping
        settings: {
          anonymous: isAnonymous,
          collect_identity: collectIdentity,
          auto_close: autoClose,
          response_limit: responseLimit,
          allow_multiple_submissions: allowMultiple,
          language,
          timezone
        }
      });

      if (res.error) {
        setError(typeof res.error === 'string' ? res.error : 'Failed to create survey.');
        setIsSubmitting(false);
      } else {
        setSubmissionStep('Redirecting to Dashboard...');
        setTimeout(() => {
          // Mandatory redirect to Survey Dashboard (not builder)
          router.push(`/creator/surveys/${res.data.id}`);
        }, 1000);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="max-w-2xl mx-auto pb-40 px-4 pt-10">
      {/* Page Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tight text-white mb-3">Survey Blueprint</h1>
        <p className="text-white/50 text-sm leading-relaxed">
          Define the purpose, audience, and goals of your survey before entering the workspace.
        </p>
      </header>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm font-bold"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-16">
        {/* Basic Information */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-nova-cyan/10 flex items-center justify-center text-nova-cyan">
              <span className="text-xs font-black">01</span>
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Basic Information</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/70 ml-1">Survey Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Student Learning Experience Survey"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-bold text-white focus:border-nova-cyan/50 focus:ring-1 focus:ring-nova-cyan/20 transition-all outline-none placeholder:text-white/10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/70 ml-1">Objective Overview</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose and objectives of this survey..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-nova-cyan/50 focus:ring-1 focus:ring-nova-cyan/20 transition-all outline-none placeholder:text-white/10 resize-none"
              />
            </div>

            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-white/70 ml-1">Linked Project</label>
              <div
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.07] transition-all"
              >
                {selectedProject ? (
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{selectedProject.title}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase tracking-wider text-nova-cyan">{selectedProject.status}</span>
                      <span className="text-[10px] text-white/20">•</span>
                      <span className="text-[10px] uppercase tracking-wider text-white/40">{selectedProject.visibility}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-white/20 italic">Independent Survey (Optional)</span>
                )}
                <ChevronDown size={18} className={`text-white/20 transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {showProjectDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-50 left-0 right-0 mt-2 bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl"
                  >
                    <div className="p-4 border-b border-white/5">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                        <input
                          type="text"
                          value={projectSearch}
                          onChange={(e) => setProjectSearch(e.target.value)}
                          placeholder="Search projects..."
                          className="w-full bg-white/5 border-none rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:ring-1 focus:ring-nova-cyan/30 transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      <button
                        onClick={() => {
                          setSelectedProjectId(null);
                          setShowProjectDropdown(false);
                        }}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-all text-left"
                      >
                        <span className="text-sm text-white/40">Independent Survey</span>
                        {!selectedProjectId && <Check size={16} className="text-nova-cyan" />}
                      </button>
                      {projects
                        .filter(p => p.title.toLowerCase().includes(projectSearch.toLowerCase()))
                        .map(project => (
                          <button
                            key={project.id}
                            onClick={() => {
                              setSelectedProjectId(project.id);
                              setShowProjectDropdown(false);
                            }}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-all text-left border-t border-white/5"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">{project.title}</span>
                              <span className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{project.visibility}</span>
                            </div>
                            {selectedProjectId === project.id && <Check size={16} className="text-nova-cyan" />}
                          </button>
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Audience & Goals */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-nova-purple/10 flex items-center justify-center text-nova-purple">
              <span className="text-xs font-black">02</span>
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Audience & Goals</h2>
          </div>

          <div className="space-y-10">
            {/* Target Audience Grid */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-white/70 ml-1">Target Audience</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {AUDIENCE_OPTIONS.map(option => (
                  <button
                    key={option}
                    onClick={() => handleAudienceToggle(option)}
                    className={`px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wider border transition-all ${
                      targetAudience.includes(option)
                        ? 'bg-nova-purple text-white border-nova-purple shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Responses Grid */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-white/70 ml-1">Target Responses</label>
              <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                {RESPONSE_OPTIONS.map(option => (
                  <button
                    key={option}
                    onClick={() => setTargetResponses(option as any)}
                    className={`px-3 py-4 rounded-2xl text-[11px] font-bold border transition-all ${
                      targetResponses === option
                        ? 'bg-nova-cyan text-black border-nova-cyan shadow-[0_0_15px_rgba(0,242,255,0.3)]'
                        : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {targetResponses === 'Custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2"
                  >
                    <input
                      type="number"
                      value={customResponses}
                      onChange={(e) => setCustomResponses(e.target.value)}
                      placeholder="Enter custom response target..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-nova-cyan/50 outline-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Configuration */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-nova-green/10 flex items-center justify-center text-nova-green">
              <span className="text-xs font-black">03</span>
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Configuration</h2>
          </div>

          <div className="space-y-10">
            {/* Duration Grid */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-white/70 ml-1">Estimated Duration</label>
              <div className="grid grid-cols-2 gap-3">
                {DURATION_OPTIONS.map(option => (
                  <button
                    key={option}
                    onClick={() => setEstimatedDuration(option)}
                    className={`px-4 py-4 rounded-2xl text-[11px] font-bold border transition-all ${
                      estimatedDuration === option
                        ? 'bg-nova-green text-black border-nova-green shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                        : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility Grid */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-white/70 ml-1">Visibility</label>
              <div className="grid grid-cols-2 gap-3">
                {VISIBILITY_OPTIONS.map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setVisibility(id as any)}
                    className={`px-4 py-6 rounded-3xl flex flex-col items-center gap-3 border transition-all ${
                      visibility === id
                        ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                        : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Anonymous Responses</h4>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Do not track participant identity</p>
                </div>
                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`w-14 h-8 rounded-full transition-all relative ${isAnonymous ? 'bg-nova-cyan' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full transition-all ${isAnonymous ? 'right-1 bg-black' : 'left-1 bg-white/40'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Collect Participant Identity</h4>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Require profile verification</p>
                </div>
                <button
                  onClick={() => setCollectIdentity(!collectIdentity)}
                  className={`w-14 h-8 rounded-full transition-all relative ${collectIdentity ? 'bg-nova-cyan' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full transition-all ${collectIdentity ? 'right-1 bg-black' : 'left-1 bg-white/40'}`} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Settings */}
        <section className="space-y-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/[0.07] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white transition-all">
                <Settings size={20} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white">Advanced Settings</h4>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Limits, Logic & Locales</p>
              </div>
            </div>
            {showAdvanced ? <ChevronUp size={20} className="text-white/20" /> : <ChevronDown size={20} className="text-white/20" />}
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-8 space-y-8 bg-white/[0.02] rounded-3xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/70">Auto-close after target reached</span>
                    <button
                      onClick={() => setAutoClose(!autoClose)}
                      className={`w-12 h-6 rounded-full transition-all relative ${autoClose ? 'bg-nova-cyan' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${autoClose ? 'right-1 bg-black' : 'left-1 bg-white/40'}`} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/70">Response Limit</label>
                    <input
                      type="number"
                      value={responseLimit}
                      onChange={(e) => setResponseLimit(parseInt(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-nova-cyan/50"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/70">Allow Multiple Submissions</span>
                    <button
                      onClick={() => setAllowMultiple(!allowMultiple)}
                      className={`w-12 h-6 rounded-full transition-all relative ${allowMultiple ? 'bg-nova-cyan' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${allowMultiple ? 'right-1 bg-black' : 'left-1 bg-white/40'}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/70">Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white outline-none"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/70">Time Zone</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white outline-none"
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">EST</option>
                        <option value="PST">PST</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Live Workspace Preview */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Workspace Preview</h2>
          </div>

          <div className="p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-md">
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-xl font-black text-white truncate">{title || 'Untitled Survey'}</h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  {targetAudience.length > 0 ? targetAudience.map(a => (
                    <span key={a} className="px-3 py-1 rounded-full bg-nova-purple/10 text-nova-purple text-[10px] font-bold uppercase tracking-widest">{a}</span>
                  )) : (
                    <span className="px-3 py-1 rounded-full bg-white/5 text-white/20 text-[10px] font-bold uppercase tracking-widest italic">No Audience Defined</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-white/5">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/20 block mb-1">Target</label>
                  <span className="text-sm font-bold text-white">{targetResponses === 'Custom' ? customResponses || '0' : targetResponses} Responses</span>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/20 block mb-1">Visibility</label>
                  <span className="text-sm font-bold text-white">{visibility}</span>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/20 block mb-1">Project</label>
                  <span className="text-sm font-bold text-nova-cyan truncate max-w-[120px] inline-block">{selectedProject?.title || 'None'}</span>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/20 block mb-1">Duration</label>
                  <span className="text-sm font-bold text-white">{estimatedDuration}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-[100] pointer-events-none">
        <div className="max-w-2xl mx-auto w-full pointer-events-auto">
          <div className="bg-[#0D0D0D]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-4 flex items-center justify-between shadow-2xl">
            <button
              onClick={() => router.back()}
              className="px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateWorkspace}
              disabled={isSubmitting}
              className="bg-white text-black px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {isSubmitting ? 'Initializing Workspace...' : 'Create Workspace'}
            </button>
          </div>
        </div>
      </div>

      {/* Submission Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-24 h-24 relative mb-8">
               <div className="absolute inset-0 rounded-full border-2 border-nova-cyan/20" />
               <div className="absolute inset-0 rounded-full border-2 border-nova-cyan border-t-transparent animate-spin" />
            </div>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">System Initializing</h2>
            <p className="text-nova-cyan text-xs font-black uppercase tracking-[0.4em] animate-pulse">{submissionStep}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
