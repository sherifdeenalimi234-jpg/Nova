"use client";

import React, { useState } from 'react';
import { createSurvey } from '@/lib/actions/surveys';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  ChevronDown,
  Type,
  CheckSquare,
  Circle,
  Star,
  Upload,
  Settings,
  Eye,
  Save,
  Rocket
} from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

type QuestionType = 'text' | 'multiple-choice' | 'rating' | 'file';

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  required: boolean;
}

export default function CreateSurveyPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleCreate = async () => {
    if (!title) {
      setErrorMessage('Please provide a title for your survey.');
      setStatus('error');
      return;
    }

    setLoading(true);
    setStatus('loading');

    try {
      const res = await createSurvey({
        title,
        description,
        status: 'draft'
      });

      if (res.error) {
        setErrorMessage(typeof res.error === 'string' ? res.error : 'Failed to create survey.');
        setStatus('error');
      } else {
        setStatus('success');
        setTimeout(() => {
          router.push(`/creator/surveys/${res.data.id}/builder`);
        }, 1000);
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred.');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <AnimatePresence>
        {status === 'error' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold"
          >
            <AlertCircle size={16} />
            {errorMessage}
          </motion.div>
        )}
        {status === 'success' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-nova-green/10 border border-nova-green/20 p-4 rounded-2xl flex items-center gap-3 text-nova-green text-xs font-bold"
          >
            <CheckCircle2 size={16} />
            Ecosystem entry verified. Redirecting...
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Initialize New Survey</h1>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Establish research node parameters</p>
         </div>
         <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="px-8 py-3 rounded-2xl bg-nova-cyan text-black text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
            >
               {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
               {loading ? 'Initializing...' : 'Create Survey'}
            </button>
         </div>
      </header>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Survey Info */}
        <section className="p-10 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-nova-cyan ml-1">Initialization Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Neural Network Feedback"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-lg font-bold focus:border-nova-cyan/50 focus:ring-0 transition-all placeholder:text-white/10"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-1">Objective Overview</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the research goals for this survey..."
              rows={4}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-sm focus:border-nova-cyan/50 focus:ring-0 transition-all placeholder:text-white/10 resize-none"
            />
          </div>
        </section>

        <div className="p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-nova-purple/5 to-transparent flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-nova-purple/10 flex items-center justify-center text-nova-purple shrink-0">
             <Settings size={24} />
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest">
            After initialization, you will be redirected to the <span className="text-white">Survey Workspace</span> to build your logic nodes and questions.
          </p>
        </div>
      </div>
    </div>
  );
}
