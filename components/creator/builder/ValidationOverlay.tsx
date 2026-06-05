"use client";

import { useState } from 'react';
import { Survey } from '@/lib/types/surveys';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Settings as SettingsIcon,
  Layout,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ValidationSummary {
  isValid: boolean;
  errors: {
    category: 'info' | 'questions' | 'settings';
    message: string;
  }[];
  stats: {
    questionCount: number;
    optionCount: number;
    requiredCount: number;
  };
}

export function validateSurvey(survey: Survey): ValidationSummary {
  const errors: ValidationSummary['errors'] = [];
  let optionCount = 0;
  let requiredCount = 0;

  // Info validation
  if (!survey.title.trim()) {
    errors.push({ category: 'info', message: 'Survey title is required' });
  }

  // Questions validation
  const questions = survey.questions || [];
  if (questions.length === 0) {
    errors.push({ category: 'questions', message: 'Add at least one question' });
  }

  questions.forEach((q, index) => {
    if (!q.title.trim()) {
      errors.push({ category: 'questions', message: `Question ${index + 1} is missing a title` });
    }
    if (q.is_required) requiredCount++;

    if (['single_choice', 'multiple_choice', 'dropdown'].includes(q.type)) {
      const options = q.options || [];
      optionCount += options.length;
      if (options.length < 2) {
        errors.push({ category: 'questions', message: `Question ${index + 1} needs at least 2 options` });
      }
      if (options.some(o => !o.text.trim())) {
        errors.push({ category: 'questions', message: `Question ${index + 1} has empty options` });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    stats: {
      questionCount: questions.length,
      optionCount,
      requiredCount
    }
  };
}

interface ValidationOverlayProps {
  survey: Survey;
  onClose: () => void;
  onNavigate: (tab: 'info' | 'questions' | 'settings') => void;
  onPublish: () => void;
  isPublishing: boolean;
}

export default function ValidationOverlay({ survey, onClose, onNavigate, onPublish, isPublishing }: ValidationOverlayProps) {
  const summary = validateSurvey(survey);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {summary.isValid ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            )}
            Survey Validation
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-2xl">×</button>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-800/50 p-3 rounded-2xl text-center">
              <MessageSquare className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <p className="text-xs text-zinc-500 uppercase font-bold">Questions</p>
              <p className="text-lg font-bold text-white">{summary.stats.questionCount}</p>
            </div>
            <div className="bg-zinc-800/50 p-3 rounded-2xl text-center">
              <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <p className="text-xs text-zinc-500 uppercase font-bold">Time</p>
              <p className="text-lg font-bold text-white">{survey.estimated_time}m</p>
            </div>
            <div className="bg-zinc-800/50 p-3 rounded-2xl text-center">
              <ShieldCheck className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <p className="text-xs text-zinc-500 uppercase font-bold">Required</p>
              <p className="text-lg font-bold text-white">{summary.stats.requiredCount}</p>
            </div>
          </div>

          {/* Error List */}
          <div className="space-y-3">
            {summary.errors.length > 0 ? (
              summary.errors.map((error, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onNavigate(error.category);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl group hover:border-amber-500/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                      {error.category === 'info' && <Layout className="w-4 h-4" />}
                      {error.category === 'questions' && <MessageSquare className="w-4 h-4" />}
                      {error.category === 'settings' && <SettingsIcon className="w-4 h-4" />}
                    </div>
                    <p className="text-sm text-amber-200/80 text-left">{error.message}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-500/50 group-hover:translate-x-1 transition-transform" />
                </button>
              ))
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-green-400 font-bold mb-1">Looking Good!</p>
                <p className="text-sm text-zinc-500">Your survey is valid and ready to be published.</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-zinc-800/30">
          {summary.isValid ? (
            <button
              onClick={onPublish}
              disabled={isPublishing}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-700 text-black font-bold rounded-2xl shadow-lg shadow-cyan-500/20 transition-all"
            >
              {isPublishing ? 'Publishing...' : 'Confirm & Publish'}
            </button>
          ) : (
            <p className="text-center text-xs text-zinc-500">
              Please fix the issues above to enable publishing.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ShieldCheck({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
