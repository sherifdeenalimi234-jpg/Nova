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
import SurveyInfo from '@/components/creator/builder/SurveyInfo';
import SurveySettingsPanel from '@/components/creator/builder/SurveySettingsPanel';
import QuestionList from '@/components/creator/builder/QuestionList';
import ValidationOverlay from '@/components/creator/builder/ValidationOverlay';
import SurveyPreview from '@/components/creator/builder/SurveyPreview';
import SuccessScreen from '@/components/creator/builder/SuccessScreen';
import { updateSurveyStatus } from '@/lib/actions/surveys';

interface BuilderClientProps {
  initialSurvey: Survey;
}

type Tab = 'info' | 'questions' | 'settings' | 'preview';

export default function BuilderClient({ initialSurvey }: BuilderClientProps) {
  const [survey, setSurvey] = useState<Survey>(initialSurvey);
  const [activeTab, setActiveTab] = useState<Tab>('info');
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
    { id: 'info', label: 'Info', icon: Layout },
    { id: 'questions', label: 'Questions', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'preview', label: 'Preview', icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/creator/surveys"
              className="w-10 h-10 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold truncate max-w-[200px] md:max-w-md">
                {survey.title || 'Untitled Survey'}
              </h1>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${survey.status === 'published' ? 'bg-green-500' : 'bg-zinc-500'}`} />
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                  {survey.status} • Last saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowValidation(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm transition-all border border-zinc-800"
            >
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              Validate
            </button>
            <button
              onClick={() => setShowValidation(true)}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20"
            >
              Publish
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SurveyInfo survey={survey} onUpdate={handleUpdate} />
            </motion.div>
          )}

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

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SurveySettingsPanel survey={survey} onUpdate={handleUpdate} />
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

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-zinc-800 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-zinc-500 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'fill-cyan-400/10' : ''}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-2 w-12 h-1 bg-cyan-500 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
