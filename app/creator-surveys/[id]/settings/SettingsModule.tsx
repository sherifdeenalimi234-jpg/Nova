"use client";

import React, { useState, useEffect } from 'react';
import { Settings, Shield, Trash2, Database, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { Survey } from '@/lib/types/surveys';
import { updateSurveyDetails, deleteSurvey } from '@/lib/actions/surveys';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsModule({ survey: initialSurvey }: { survey: Survey }) {
  const [survey, setSurvey] = useState<Survey>(initialSurvey);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateSurveyDetails(survey.id, {
      title: survey.title,
      survey_mode: survey.survey_mode,
      visibility: survey.visibility,
      settings: survey.settings
    });

    if (!error) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      alert("Failed to save settings: " + (error.message || error));
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to permanently delete this research node? This action cannot be undone.")) {
      const { error } = await deleteSurvey(survey.id);
      if (!error) {
        router.push('/creator-surveys');
      } else {
        alert("Failed to delete survey.");
      }
    }
  };

  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex items-center justify-between">
         <div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Workspace Settings</h2>
            <p className="text-white/40 text-xs uppercase tracking-widest font-medium">Node configuration and security protocols</p>
         </div>
         <button
           onClick={handleSave}
           disabled={isSaving}
           className="flex items-center gap-2 px-6 py-3 rounded-xl bg-nova-purple text-white text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(188,19,254,0.4)] transition-all disabled:opacity-50"
         >
           {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
           Save Changes
         </button>
      </header>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-2xl bg-nova-green/10 border border-nova-green/20 text-nova-green text-xs font-bold flex items-center gap-3"
          >
            <CheckCircle2 size={16} />
            Settings synchronized successfully.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
         {/* General Settings */}
         <section className="p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/5 space-y-8">
            <div className="flex items-center gap-4 text-white/40">
               <Settings size={20} />
               <h3 className="text-xs font-black uppercase tracking-widest">General Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Survey Name</label>
                  <input
                    value={survey.title}
                    onChange={(e) => setSurvey({...survey, title: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-nova-purple/50 outline-none transition-all"
                    placeholder="Survey Title"
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Survey Mode</label>
                  <select
                    value={survey.survey_mode}
                    onChange={(e) => setSurvey({...survey, survey_mode: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm appearance-none focus:border-nova-purple/50 outline-none transition-all"
                  >
                     <option value="Standard Survey">Standard Survey</option>
                     <option value="Conversational Survey">Conversational Survey</option>
                     <option value="Assessment & Quiz">Assessment & Quiz</option>
                  </select>
               </div>
            </div>
         </section>

         {/* Access & Security */}
         <section className="p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/5 space-y-8">
            <div className="flex items-center gap-4 text-white/40">
               <Shield size={20} />
               <h3 className="text-xs font-black uppercase tracking-widest">Security Protocols</h3>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${survey.visibility === 'Private' ? 'bg-nova-purple/10 text-nova-purple' : 'bg-white/5 text-white/20'}`}>
                        <Database size={18} />
                     </div>
                     <div>
                        <p className="text-xs font-bold mb-1">One Response Per Participant</p>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest">Restrict multiple submissions from same user</p>
                     </div>
                  </div>
                  <button
                    onClick={() => setSurvey({
                      ...survey,
                      settings: { ...survey.settings, one_response_per_participant: !survey.settings?.one_response_per_participant }
                    })}
                    className={`w-12 h-6 rounded-full transition-all relative ${survey.settings?.one_response_per_participant ? 'bg-nova-purple' : 'bg-white/10'}`}
                  >
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${survey.settings?.one_response_per_participant ? 'right-1' : 'left-1'}`} />
                  </button>
               </div>

               <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${survey.settings?.anonymous ? 'bg-nova-cyan/10 text-nova-cyan' : 'bg-white/5 text-white/20'}`}>
                        <Shield size={18} />
                     </div>
                     <div>
                        <p className="text-xs font-bold mb-1">Anonymous Collection</p>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest">Do not track participant identity</p>
                     </div>
                  </div>
                  <button
                    onClick={() => setSurvey({
                      ...survey,
                      settings: { ...survey.settings, anonymous: !survey.settings?.anonymous }
                    })}
                    className={`w-12 h-6 rounded-full transition-all relative ${survey.settings?.anonymous ? 'bg-nova-cyan' : 'bg-white/10'}`}
                  >
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${survey.settings?.anonymous ? 'right-1' : 'left-1'}`} />
                  </button>
               </div>
            </div>
         </section>

         {/* Danger Zone */}
         <section className="p-10 rounded-[2.5rem] bg-red-500/[0.02] border border-red-500/10 space-y-8">
            <div className="flex items-center gap-4 text-red-500/40">
               <Trash2 size={20} />
               <h3 className="text-xs font-black uppercase tracking-widest">Danger Zone</h3>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
               <div>
                  <p className="text-xs font-bold mb-1">Delete Research Node</p>
                  <p className="text-[9px] text-white/20 uppercase tracking-widest">Permanently remove this survey and all associated data</p>
               </div>
               <button
                 onClick={handleDelete}
                 className="px-8 py-4 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
               >
                  Terminate Node
               </button>
            </div>
         </section>
      </div>
    </div>
  );
}
