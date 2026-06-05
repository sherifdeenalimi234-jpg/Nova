"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Settings,
  Eye,
  Save,
  Rocket,
  Type,
  AlignLeft,
  CheckCircle2,
  List,
  ChevronDown,
  Star,
  Upload,
  MoreVertical,
  GripVertical,
  Layout,
  Clock,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  ArrowLeft,
  X
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { updateSurveyMetadata, syncQuestions, validateSurvey } from '@/lib/actions/surveys/architect';
import { updateSurveyStatus } from '@/lib/actions/surveys/creator-actions';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type Tab = 'info' | 'builder' | 'preview' | 'settings';

export default function SurveyArchitect({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [survey, setSurvey] = useState(initialData);
  const [questions, setQuestions] = useState<any[]>(initialData.questions || []);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<{ isValid: boolean; errors: string[] } | null>(null);

  // Auto-save metadata
  useEffect(() => {
    const timer = setTimeout(async () => {
      setSaving(true);
      try {
        await updateSurveyMetadata(survey.id, {
          title: survey.title,
          description: survey.description,
          category: survey.category,
          settings: survey.settings,
          tags: survey.tags,
          cover_image: survey.cover_image
        });
        setLastSaved(new Date());
      } catch (err) {
        console.error("Auto-save failed", err);
      } finally {
        setSaving(false);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [survey.title, survey.description, survey.category, survey.settings, survey.tags, survey.cover_image]);

  // Auto-save questions
  useEffect(() => {
    const timer = setTimeout(async () => {
      setSaving(true);
      try {
        await syncQuestions(survey.id, questions);
        setLastSaved(new Date());
      } catch (err) {
        console.error("Questions sync failed", err);
      } finally {
        setSaving(false);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [questions]);

  const addQuestion = (type: string) => {
    const newQuestion = {
      id: `temp-${Date.now()}`,
      type,
      question_text: '',
      description: '',
      is_required: true,
      placeholder: '',
      options: ['single_choice', 'multiple_choice', 'dropdown'].includes(type) ? [{ option_text: 'Option 1', order_index: 0 }] : []
    };
    setQuestions([...questions, newQuestion]);
    setActiveTab('builder');
  };

  const updateQuestion = (id: string, updates: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const duplicateQuestion = (q: any) => {
    const duplicated = {
      ...q,
      id: `temp-${Date.now()}`,
      order_index: questions.length
    };
    setQuestions([...questions, duplicated]);
  };

  const addOption = (qId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          options: [...(q.options || []), { option_text: `Option ${(q.options?.length || 0) + 1}`, order_index: q.options?.length || 0 }]
        };
      }
      return q;
    }));
  };

  const updateOption = (qId: string, oIdx: number, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newOptions = [...q.options];
        newOptions[oIdx] = { ...newOptions[oIdx], option_text: text };
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const deleteOption = (qId: string, oIdx: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          options: q.options.filter((_: any, i: number) => i !== oIdx)
        };
      }
      return q;
    }));
  };

  const handlePublishClick = async () => {
    setIsValidating(true);
    const report = await validateSurvey(survey.id);
    setValidationReport(report);
    setIsValidating(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32 px-4">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 z-50 bg-black/80 backdrop-blur-xl py-4 border-b border-white/5 -mx-4 px-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className={cn("w-2 h-2 rounded-full", saving ? "bg-nova-purple animate-pulse" : "bg-nova-green")} />
             <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                {saving ? "Saving Intelligence..." : lastSaved ? `Last Saved ${lastSaved.toLocaleTimeString()}` : "Architect Mode"}
             </span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight">{survey.title || "Untitled Protocol"}</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('preview')}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all"
            title="Preview Matrix"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={handlePublishClick}
            disabled={saving || isValidating}
            className="px-6 py-3 rounded-2xl bg-nova-purple text-white text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(188,19,254,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isValidating ? <Clock size={14} className="animate-spin" /> : <Rocket size={14} />}
            Deploy Protocol
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 w-full md:w-max">
         {[
           { id: 'info', label: 'Identity', icon: Layout },
           { id: 'builder', label: 'Architecture', icon: Type },
           { id: 'settings', label: 'Logic', icon: Settings },
         ].map((t) => (
           <button
             key={t.id}
             onClick={() => setActiveTab(t.id as Tab)}
             className={cn(
               "flex-1 md:flex-none px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
               activeTab === t.id ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white hover:bg-white/5"
             )}
           >
              <t.icon size={14} />
              {t.label}
           </button>
         ))}
      </nav>

      {/* Main Content Area */}
      <main>
         <AnimatePresence mode="wait">
            {activeTab === 'info' && (
               <motion.section
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 key="info"
                 className="space-y-6"
               >
                  <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Protocol Title</label>
                        <input
                          type="text"
                          value={survey.title}
                          onChange={(e) => setSurvey({...survey, title: e.target.value})}
                          placeholder="Global Ecosystem Inquiry..."
                          className="w-full bg-transparent border-none text-2xl font-black uppercase tracking-tight focus:ring-0 placeholder:text-white/10"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Mission Objective (Description)</label>
                        <textarea
                          value={survey.description}
                          onChange={(e) => setSurvey({...survey, description: e.target.value})}
                          placeholder="Define the scope and importance of this intelligence gathering..."
                          rows={3}
                          className="w-full bg-transparent border-none text-sm focus:ring-0 placeholder:text-white/10 resize-none leading-relaxed"
                        />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Classification (Category)</label>
                           <select
                             value={survey.category}
                             onChange={(e) => setSurvey({...survey, category: e.target.value})}
                             className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-nova-cyan/40 appearance-none"
                           >
                              <option value="General">General Intel</option>
                              <option value="Research">Deep Research</option>
                              <option value="Feedback">Node Feedback</option>
                              <option value="Innovation">Innovation Audit</option>
                           </select>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Est. Time To Synchronize (Minutes)</label>
                           <input
                             type="number"
                             value={survey.settings?.estimated_time}
                             onChange={(e) => setSurvey({...survey, settings: {...survey.settings, estimated_time: parseInt(e.target.value)}})}
                             className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold focus:outline-none focus:border-nova-cyan/40"
                           />
                        </div>
                     </div>
                  </div>
               </motion.section>
            )}

            {activeTab === 'builder' && (
               <motion.section
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 key="builder"
                 className="space-y-8"
               >
                  <Reorder.Group axis="y" values={questions} onReorder={setQuestions} className="space-y-6">
                     {questions.map((q, idx) => (
                        <Reorder.Item
                          key={q.id}
                          value={q}
                          className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl group relative overflow-hidden"
                        >
                           <div className="flex items-center justify-between mb-8">
                              <div className="flex items-center gap-4">
                                 <GripVertical className="text-white/10 cursor-grab active:cursor-grabbing" size={16} />
                                 <span className="text-[10px] font-black text-white/20">NODE #{idx + 1}</span>
                                 <div className="px-3 py-1 rounded-lg bg-nova-cyan/10 border border-nova-cyan/20 text-[8px] font-black uppercase tracking-widest text-nova-cyan">
                                    {q.type.replace('_', ' ')}
                                 </div>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => duplicateQuestion(q)} className="p-2 text-white/20 hover:text-white transition-colors" title="Duplicate Node">
                                    <Copy size={16} />
                                 </button>
                                 <button onClick={() => deleteQuestion(q.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors" title="Purge Node">
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </div>

                           <div className="space-y-6">
                              <input
                                type="text"
                                value={q.question_text}
                                onChange={(e) => updateQuestion(q.id, { question_text: e.target.value })}
                                placeholder="Enter inquiry question..."
                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-nova-cyan/30 transition-all"
                              />

                              <input
                                type="text"
                                value={q.description}
                                onChange={(e) => updateQuestion(q.id, { description: e.target.value })}
                                placeholder="Optional: Helper text to guide respondent"
                                className="w-full bg-transparent border-none text-[10px] uppercase tracking-widest focus:ring-0 placeholder:text-white/10"
                              />

                              {['single_choice', 'multiple_choice', 'dropdown'].includes(q.type) && (
                                 <div className="space-y-3 pt-4">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-white/20 ml-1">Logic Options</label>
                                    <div className="grid grid-cols-1 gap-2">
                                       {q.options?.map((opt: any, oIdx: number) => (
                                          <div key={oIdx} className="flex items-center gap-3 group/opt">
                                             <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/20">
                                                {oIdx + 1}
                                             </div>
                                             <input
                                               type="text"
                                               value={opt.option_text}
                                               onChange={(e) => updateOption(q.id, oIdx, e.target.value)}
                                               className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-nova-cyan/20"
                                             />
                                             <button
                                                onClick={() => deleteOption(q.id, oIdx)}
                                                className="opacity-0 group-hover/opt:opacity-100 p-2 text-white/10 hover:text-red-500 transition-all"
                                             >
                                                <X size={14} />
                                             </button>
                                          </div>
                                       ))}
                                       <button
                                          onClick={() => addOption(q.id)}
                                          className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-nova-cyan/60 hover:text-nova-cyan mt-2 transition-colors ml-1"
                                       >
                                          <Plus size={14} /> Add Option Node
                                       </button>
                                    </div>
                                 </div>
                              )}
                           </div>

                           <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/5">
                              <div className="flex items-center gap-3">
                                 <button
                                   onClick={() => updateQuestion(q.id, { is_required: !q.is_required })}
                                   className={cn(
                                     "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all",
                                     q.is_required ? "bg-nova-cyan/10 border-nova-cyan/20 text-nova-cyan" : "bg-white/5 border-white/10 text-white/20"
                                   )}
                                 >
                                    {q.is_required ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                    <span className="text-[8px] font-black uppercase tracking-widest">Required</span>
                                 </button>
                              </div>
                           </div>
                        </Reorder.Item>
                     ))}
                  </Reorder.Group>

                  {/* Add Question Controls */}
                  <div className="p-10 rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center gap-10">
                     <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-2xl bg-nova-purple/10 border border-nova-purple/20 flex items-center justify-center mb-4">
                           <Plus className="text-nova-purple" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Integrate New Component</h3>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 w-full max-w-4xl">
                        {[
                          { type: 'short_text', icon: Type, label: 'Text' },
                          { type: 'long_text', icon: AlignLeft, label: 'Long Text' },
                          { type: 'single_choice', icon: CheckCircle2, label: 'Choice' },
                          { type: 'multiple_choice', icon: List, label: 'Multi' },
                          { type: 'dropdown', icon: ChevronDown, label: 'Select' },
                          { type: 'rating', icon: Star, label: 'Rating' },
                          { type: 'file', icon: Upload, label: 'File' },
                        ].map((tool) => (
                          <button
                            key={tool.type}
                            onClick={() => addQuestion(tool.type)}
                            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-nova-cyan/40 hover:bg-white/[0.05] transition-all group"
                          >
                             <tool.icon size={20} className="text-white/20 group-hover:text-nova-cyan transition-colors" />
                             <span className="text-[8px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">{tool.label}</span>
                          </button>
                        ))}
                     </div>
                  </div>
               </motion.section>
            )}

            {activeTab === 'settings' && (
               <motion.section
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 key="settings"
                 className="grid grid-cols-1 md:grid-cols-2 gap-8"
               >
                  <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-8">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-nova-purple flex items-center gap-3">
                        <Settings size={14} /> Operational Rules
                     </h3>
                     <div className="space-y-6">
                        {[
                          { key: 'anonymous', label: 'Anonymous Protocols', desc: 'Respondent identity remains encrypted' },
                          { key: 'one_response_per_person', label: 'Single Intake Limit', desc: 'One entry per verified node' },
                          { key: 'allow_multiple_responses', label: 'Multiple Submission', desc: 'Allow repeated signal input' },
                          { key: 'require_login', label: 'Identity Verification', desc: 'Require ecosystem authentication' },
                        ].map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between group cursor-pointer" onClick={() => {
                             setSurvey({
                                ...survey,
                                settings: {
                                   ...survey.settings,
                                   [setting.key]: !survey.settings[setting.key]
                                }
                             });
                          }}>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/80">{setting.label}</p>
                                <p className="text-[8px] text-white/20 uppercase tracking-widest">{setting.desc}</p>
                             </div>
                             <div className={cn(
                                "w-10 h-5 rounded-full transition-all flex items-center px-1",
                                survey.settings[setting.key] ? "bg-nova-purple shadow-[0_0_15px_rgba(188,19,254,0.3)]" : "bg-white/5 border border-white/10"
                             )}>
                                <motion.div
                                   animate={{ x: survey.settings[setting.key] ? 20 : 0 }}
                                   className="w-3 h-3 rounded-full bg-white shadow-lg"
                                />
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-8">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-nova-cyan flex items-center gap-3">
                        <Layout size={14} /> Discovery Metadata
                     </h3>
                     <div className="space-y-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Discovery Tags</label>
                           <div className="flex flex-wrap gap-2">
                              {survey.tags?.map((tag: string, i: number) => (
                                 <span key={i} className="px-3 py-1.5 rounded-lg bg-nova-cyan/10 border border-nova-cyan/20 text-[9px] font-black text-nova-cyan flex items-center gap-2">
                                    {tag}
                                    <button onClick={() => setSurvey({...survey, tags: survey.tags.filter((_: any, idx: number) => idx !== i)})}>
                                       <X size={12} />
                                    </button>
                                 </span>
                              ))}
                              <input
                                 placeholder="Add Tag+"
                                 onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                       const val = (e.target as HTMLInputElement).value;
                                       if (val && !survey.tags.includes(val)) {
                                          setSurvey({...survey, tags: [...survey.tags, val]});
                                          (e.target as HTMLInputElement).value = '';
                                       }
                                    }
                                 }}
                                 className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 placeholder:text-white/10 w-24"
                              />
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.section>
            )}

            {activeTab === 'preview' && (
               <motion.section
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.98 }}
                 key="preview"
                 className="flex justify-center"
               >
                  <div className="w-full max-w-md bg-[#0a0a0b] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(188,19,254,0.1)] relative">
                     <div className="absolute top-0 left-0 w-full p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-10">
                        <button onClick={() => setActiveTab('builder')} className="text-white/40 hover:text-white transition-colors">
                           <ArrowLeft size={20} />
                        </button>
                        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-nova-purple">Preview Mode</span>
                        <div className="w-5" />
                     </div>

                     <div className="p-10 pt-24 space-y-10">
                        <header>
                           <h2 className="text-2xl font-black uppercase tracking-tight mb-4">{survey.title}</h2>
                           <p className="text-sm text-white/40 leading-relaxed">{survey.description}</p>
                        </header>

                        <div className="space-y-12">
                           {questions.map((q, i) => (
                              <div key={q.id} className="space-y-6">
                                 <div>
                                    <div className="flex items-center gap-2 mb-3">
                                       <span className="text-[9px] font-black text-nova-cyan">QUESTION 0{i + 1}</span>
                                       {q.is_required && <span className="text-[14px] text-red-500">*</span>}
                                    </div>
                                    <h3 className="text-lg font-bold text-white leading-snug">{q.question_text || "Inquiry node pending..."}</h3>
                                    {q.description && <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">{q.description}</p>}
                                 </div>

                                 {['short_text', 'long_text'].includes(q.type) && (
                                    <input
                                       disabled
                                       placeholder={q.placeholder || "Enter response..."}
                                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm"
                                    />
                                 )}

                                 {['single_choice', 'multiple_choice', 'dropdown'].includes(q.type) && (
                                    <div className="grid grid-cols-1 gap-3">
                                       {q.options?.map((opt: any, oIdx: number) => (
                                          <div key={oIdx} className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-widest text-white/40 flex items-center justify-between">
                                             {opt.option_text}
                                             <div className="w-4 h-4 rounded-full border border-white/20" />
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </div>
                           ))}
                        </div>

                        <button disabled className="w-full py-5 rounded-2xl bg-nova-purple text-white text-[10px] font-black uppercase tracking-widest opacity-40">
                           Submit Intelligence
                        </button>
                     </div>
                  </div>
               </motion.section>
            )}
         </AnimatePresence>
      </main>

      {/* Validation Report Modal */}
      <AnimatePresence>
         {validationReport && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
               <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="w-full max-w-lg bg-[#0a0a0b] border border-white/10 rounded-[3rem] p-10 relative overflow-hidden"
               >
                  <div className={cn(
                     "absolute top-0 left-0 w-full h-1",
                     validationReport.isValid ? "bg-nova-green" : "bg-red-500"
                  )} />
                  <header className="text-center mb-10">
                     <div className={cn(
                        "w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center border",
                        validationReport.isValid ? "bg-nova-green/10 border-nova-green/20 text-nova-green" : "bg-red-500/10 border-red-500/20 text-red-500"
                     )}>
                        {validationReport.isValid ? <Check size={40} /> : <AlertCircle size={40} />}
                     </div>
                     <h2 className="text-2xl font-black uppercase tracking-tight">
                        {validationReport.isValid ? "Protocol Ready" : "Architecture Error"}
                     </h2>
                     <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mt-2">Validation Result</p>
                  </header>

                  <div className="space-y-4 mb-10 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                     {validationReport.isValid ? (
                        <div className="p-6 rounded-2xl bg-nova-green/5 border border-nova-green/10 text-center">
                           <p className="text-sm text-nova-green/80">All systems operational. The survey architecture meets the minimum required standards for ecosystem deployment.</p>
                        </div>
                     ) : (
                        validationReport.errors.map((err, i) => (
                           <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500/60 text-xs italic">
                              <X size={14} className="mt-0.5 flex-shrink-0" />
                              {err}
                           </div>
                        ))
                     )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <button
                       onClick={() => setValidationReport(null)}
                       className="py-5 rounded-2xl bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                     >
                        Close Report
                     </button>
                     {validationReport.isValid ? (
                        <button
                          onClick={async () => {
                             await updateSurveyStatus(survey.id, 'published');
                             router.push(`/survey/create/success/${survey.id}`);
                          }}
                          className="py-5 rounded-2xl bg-nova-green text-white text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all flex items-center justify-center gap-2"
                        >
                           Deploy Protocol <ChevronRight size={14} />
                        </button>
                     ) : (
                        <button
                           onClick={() => {
                              setValidationReport(null);
                              setActiveTab('builder');
                           }}
                           className="py-5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-nova-cyan transition-all"
                        >
                           Fix Errors
                        </button>
                     )}
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
