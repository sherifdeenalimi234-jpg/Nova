"use client";

import { useState } from 'react';
import { Survey, SurveyQuestion } from '@/lib/types/surveys';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Layout,
  Settings,
  Eye,
  CheckCircle2,
  Save,
  MessageSquare,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import SurveyInfo from '@/components/surveys/builder/SurveyInfo';
import SurveySettingsPanel from '@/components/surveys/builder/SurveySettingsPanel';
import QuestionList from '@/components/surveys/builder/QuestionList';
import ValidationOverlay from '@/components/surveys/builder/ValidationOverlay';
import SurveyPreview from '@/components/surveys/builder/SurveyPreview';
import SuccessScreen from '@/components/surveys/builder/SuccessScreen';
import { updateSurveyStatus } from '@/lib/actions/surveys';

interface BuilderClientProps {
  initialSurvey: Survey;
}

type Tab = 'questions' | 'preview';

export default function BuilderClient({ initialSurvey }: BuilderClientProps) {
  const [survey, setSurvey] = useState<Survey>(initialSurvey);
  const [activeTab, setActiveTab] = useState<Tab>('questions');
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleUpdate = (updates: Partial<Survey>) => {
    setSurvey(prev => ({ ...prev, ...updates }));
    setLastSaved(new Date());
  };

  const handlePublish = async () => {
    setIsSaving(true);
    const result = await updateSurveyStatus(survey.id, 'published');
    if (!result.error) {
      setSurvey(prev => ({ ...prev, status: 'published' }));
      setShowSuccess(true);
    }
    setIsSaving(false);
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'questions', label: 'Architect', icon: MessageSquare },
    { id: 'preview', label: 'Preview', icon: Eye },
  ];

  return (
    <div className="bg-transparent text-white pb-24">
      {/* Header with quick actions */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Question Architect</h2>
           <p className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-medium">Design and calibrate intelligence nodes</p>
        </div>

        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                <span className={`w-1.5 h-1.5 rounded-full ${survey.status === 'published' ? 'bg-nova-green animate-pulse' : 'bg-nova-cyan'}`} />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                  {survey.status} • Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
            <button
              onClick={() => setShowValidation(true)}
              className="flex items-center gap-2 px-6 h-12 bg-nova-purple text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-lg shadow-nova-purple/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              Publish Node
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'questions' && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <QuestionList surveyId={survey.id} initialQuestions={survey.questions || []} />
            </motion.div>
          )}

          {activeTab === 'preview' && (
             <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
             >
                <SurveyPreview survey={survey} />
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showValidation && (
          <ValidationOverlay
            survey={survey}
            onClose={() => setShowValidation(false)}
            onNavigate={(tab) => setActiveTab(tab)}
            onPublish={handlePublish}
            isPublishing={isSaving}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <SuccessScreen
            surveyId={survey.id}
            surveyTitle={survey.title}
          />
        )}
      </AnimatePresence>

      {/* Sub-module Navigation */}
      <nav className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-black/40 backdrop-blur-3xl border border-white/10 p-1.5 rounded-2xl flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all relative ${
                  isActive ? 'bg-white text-black' : 'text-white/40 hover:text-white'
                }`}
              >
                <Icon size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            );
          })}
      </nav>
    </div>
  );
}
