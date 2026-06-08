"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Survey, SurveyQuestion, SurveySection } from '@/lib/types/surveys';
import StructurePanel from './StructurePanel';
import BuilderCanvas from './BuilderCanvas';
import PropertiesInspector from './PropertiesInspector';
import { motion, AnimatePresence } from 'framer-motion';
import { saveQuestion, deleteQuestion, saveSection, deleteSection } from '@/lib/actions/surveys';
import {
  ChevronLeft,
  ChevronRight,
  Settings2,
  Layers,
  Layout,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface BuildWorkspaceProps {
  survey: Survey;
}

export type BuilderMode = 'structure' | 'canvas' | 'inspector';

export default function BuildWorkspace({ survey: initialSurvey }: BuildWorkspaceProps) {
  const [survey, setSurvey] = useState<Survey>(initialSurvey);
  const [activeMode, setActiveMode] = useState<BuilderMode>('canvas');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Sync with initial survey if it changes externally
  useEffect(() => {
    setSurvey(initialSurvey);
  }, [initialSurvey]);

  // Validation Layer
  useEffect(() => {
    const errors: any[] = [];
    const questions = survey.questions || [];

    questions.forEach((q, idx) => {
      if (!q.title || q.title.trim() === '') {
        errors.push({ id: q.id, type: 'question', field: 'title', message: `Question ${idx + 1} is missing a title.` });
      }
      if (['single_choice', 'multiple_choice', 'dropdown'].includes(q.type)) {
        if (!q.options || q.options.length === 0) {
          errors.push({ id: q.id, type: 'question', field: 'options', message: `Question ${idx + 1} has no options.` });
        } else if (q.options.some(o => !o.text || o.text.trim() === '')) {
          errors.push({ id: q.id, type: 'question', field: 'options', message: `Question ${idx + 1} has empty options.` });
        }
      }
    });

    setValidationErrors(errors);
  }, [survey]);

  const handleSelectQuestion = (id: string) => {
    setSelectedQuestionId(id);
    setSelectedSectionId(null);
    if (window.innerWidth < 1280) {
      setActiveMode('inspector');
    }
  };

  const handleSelectSection = (id: string) => {
    setSelectedSectionId(id);
    setSelectedQuestionId(null);
    if (window.innerWidth < 1280) {
      setActiveMode('inspector');
    }
  };

  const handleUpdateItem = async (type: 'question' | 'section', id: string, updates: any) => {
    setIsSaving(true);
    setSaveError(null);

    // Optimistic UI Update
    setSurvey(prev => {
      if (type === 'question') {
        return {
          ...prev,
          questions: prev.questions?.map(q => q.id === id ? { ...q, ...updates } : q)
        };
      } else {
        return {
          ...prev,
          sections: prev.sections?.map(s => s.id === id ? { ...s, ...updates } : s)
        };
      }
    });

    try {
      let result;
      if (type === 'question') {
        result = await saveQuestion(survey.id, { id, ...updates });
      } else {
        result = await saveSection(survey.id, { id, ...updates });
      }

      if (result.error) throw result.error;
      setLastSaved(new Date());
    } catch (err: any) {
      setSaveError(err.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (type: 'question' | 'section', id: string) => {
    setIsSaving(true);

    // Optimistic UI Update
    setSurvey(prev => {
      if (type === 'question') {
        return {
          ...prev,
          questions: prev.questions?.filter(q => q.id !== id)
        };
      } else {
        return {
          ...prev,
          sections: prev.sections?.filter(s => s.id !== id)
        };
      }
    });

    if (selectedQuestionId === id || selectedSectionId === id) {
      setSelectedQuestionId(null);
      setSelectedSectionId(null);
      setActiveMode('canvas');
    }

    try {
      let error;
      if (type === 'question') {
        const result = await deleteQuestion(survey.id, id);
        error = result.error;
      } else {
        const result = await deleteSection(survey.id, id);
        error = result.error;
      }

      if (error) throw error;
      setLastSaved(new Date());
    } catch (err: any) {
      setSaveError(err.message || "Failed to delete item");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-140px)] relative">

      {/* Mobile Mode Switcher */}
      <div className="flex md:hidden items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 mb-4 rounded-xl">
        <button
          onClick={() => setActiveMode('structure')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeMode === 'structure' ? 'text-nova-purple bg-nova-purple/10' : 'text-white/40'}`}
        >
          <Layers size={18} />
          <span className="text-[8px] font-black uppercase">Structure</span>
        </button>
        <button
          onClick={() => setActiveMode('canvas')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeMode === 'canvas' ? 'text-nova-purple bg-nova-purple/10' : 'text-white/40'}`}
        >
          <Layout size={18} />
          <span className="text-[8px] font-black uppercase">Canvas</span>
        </button>
        <button
          onClick={() => setActiveMode('inspector')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeMode === 'inspector' ? 'text-nova-purple bg-nova-purple/10' : 'text-white/40'}`}
        >
          <Settings2 size={18} />
          <span className="text-[8px] font-black uppercase">Inspector</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden gap-4">

        {/* Left Panel: Structure */}
        <motion.aside
          initial={false}
          animate={{
            width: isLeftPanelOpen ? 320 : 0,
            opacity: isLeftPanelOpen ? 1 : 0,
            x: isLeftPanelOpen ? 0 : -20
          }}
          className={`hidden lg:flex flex-col border border-white/5 bg-white/[0.02] rounded-[2.5rem] overflow-hidden backdrop-blur-sm transition-all duration-300 ease-in-out`}
        >
          <div className="h-full overflow-y-auto custom-scrollbar">
            <StructurePanel
              survey={survey}
              selectedQuestionId={selectedQuestionId}
              selectedSectionId={selectedSectionId}
              onSelectQuestion={handleSelectQuestion}
              onSelectSection={handleSelectSection}
            />
          </div>
        </motion.aside>

        {/* Center Panel: Builder Canvas */}
        <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${activeMode !== 'canvas' && 'hidden md:flex'}`}>
          <div className="flex-1 overflow-y-auto custom-scrollbar rounded-[2.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-sm">
             <BuilderCanvas
               survey={survey}
               onSelectQuestion={handleSelectQuestion}
               selectedQuestionId={selectedQuestionId}
             />
          </div>
        </main>

        {/* Right Panel: Properties Inspector */}
        <motion.aside
          initial={false}
          animate={{
            width: isRightPanelOpen ? 350 : 0,
            opacity: isRightPanelOpen ? 1 : 0,
            x: isRightPanelOpen ? 0 : 20
          }}
          className={`hidden xl:flex flex-col border border-white/5 bg-white/[0.02] rounded-[2.5rem] overflow-hidden backdrop-blur-sm transition-all duration-300 ease-in-out`}
        >
          <div className="h-full overflow-y-auto custom-scrollbar">
            <PropertiesInspector
              survey={survey}
              selectedQuestionId={selectedQuestionId}
              selectedSectionId={selectedSectionId}
              onUpdate={handleUpdateItem}
              onDelete={handleDeleteItem}
            />
          </div>
        </motion.aside>

        {/* Mobile Views (Overlaying other panels based on activeMode) */}
        <div className="md:hidden flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeMode === 'structure' && (
              <motion.div
                key="structure"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full bg-black/40 rounded-3xl border border-white/5 overflow-y-auto"
              >
                <StructurePanel
                  survey={survey}
                  selectedQuestionId={selectedQuestionId}
                  selectedSectionId={selectedSectionId}
                  onSelectQuestion={handleSelectQuestion}
                  onSelectSection={handleSelectSection}
                />
              </motion.div>
            )}
            {activeMode === 'canvas' && (
              <motion.div
                key="canvas"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full bg-black/40 rounded-3xl border border-white/5 overflow-y-auto"
              >
                <BuilderCanvas
                  survey={survey}
                  onSelectQuestion={handleSelectQuestion}
                  selectedQuestionId={selectedQuestionId}
                />
              </motion.div>
            )}
            {activeMode === 'inspector' && (
              <motion.div
                key="inspector"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full bg-black/40 rounded-3xl border border-white/5 overflow-y-auto"
              >
                <PropertiesInspector
                  survey={survey}
                  selectedQuestionId={selectedQuestionId}
                  selectedSectionId={selectedSectionId}
                  onUpdate={handleUpdateItem}
                  onDelete={handleDeleteItem}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sync Status Overlay (Fixed bottom) */}
      <div className="fixed bottom-24 right-10 z-50 pointer-events-none">
        <div className="flex items-center gap-3 px-4 py-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl pointer-events-auto">
          {validationErrors.length > 0 && (
            <div className="flex items-center gap-2 mr-4 pr-4 border-r border-white/10">
              <AlertCircle size={12} className="text-nova-cyan" />
              <span className="text-[9px] font-black uppercase tracking-widest text-nova-cyan">{validationErrors.length} Alerts</span>
            </div>
          )}
          {isSaving ? (
            <>
              <Loader2 size={12} className="text-nova-purple animate-spin" />
              <span className="text-[9px] font-black uppercase tracking-widest text-nova-purple">Syncing...</span>
            </>
          ) : saveError ? (
            <>
              <AlertCircle size={12} className="text-red-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-red-500">Sync Error</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={12} className="text-nova-green" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                {lastSaved ? `Synced ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Ready'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
