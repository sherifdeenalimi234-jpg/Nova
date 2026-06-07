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
    <div className="min-h-screen bg-transparent text-white pb-32">
      {/* Tab Switcher */}
      <div className="mb-8 flex p-1 bg-white/[0.03] border border-white/5 rounded-2xl">
         {tabs.map((tab) => {
           const isActive = activeTab === tab.id;
           return (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 isActive ? 'bg-nova-purple text-white shadow-lg' : 'text-white/40 hover:text-white'
               }`}
             >
               {tab.label}
             </button>
           );
         })}
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto">
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

    </div>
  );
}
