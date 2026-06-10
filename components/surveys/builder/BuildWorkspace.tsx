"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Survey, SurveyQuestion, SurveySection, SurveyOption } from '@/lib/types/surveys';
import StructurePanel from './StructurePanel';
import BuilderCanvas from './BuilderCanvas';
import PropertiesInspector from './PropertiesInspector';
import { motion, AnimatePresence } from 'framer-motion';
import {
  saveQuestion,
  deleteQuestion,
  saveSection,
  deleteSection,
  reorderQuestions,
  reorderSections,
  saveOption,
  deleteOption
} from '@/lib/actions/surveys';
import {
  Settings2,
  Layers,
  Layout,
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

  // Debouncing logic for autosave
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<{type: 'question' | 'section', id: string, updates: any}[]>([]);

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

  const performSave = async () => {
    if (pendingUpdatesRef.current.length === 0) return;

    setIsSaving(true);
    setSaveError(null);

    const updatesToProcess = [...pendingUpdatesRef.current];
    pendingUpdatesRef.current = [];

    try {
      for (const item of updatesToProcess) {
        let result;
        if (item.type === 'question') {
          result = await saveQuestion(survey.id, { id: item.id, ...item.updates });
        } else {
          result = await saveSection(survey.id, { id: item.id, ...item.updates });
        }
        if (result.error) throw result.error;
      }
      setLastSaved(new Date());
    } catch (err: any) {
      setSaveError(err.message || "Failed to save changes");
      // If failed, we might want to put them back or just let the user know
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateItem = (type: 'question' | 'section', id: string, updates: any) => {
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

    // Add to pending updates and debounce
    pendingUpdatesRef.current.push({ type, id, updates });
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(performSave, 1000); // 1s debounce
  };

  const handleDeleteItem = async (type: 'question' | 'section', id: string) => {
    setIsSaving(true);
    setSaveError(null);

    setSurvey(prev => {
      if (type === 'question') {
        return {
          ...prev,
          questions: prev.questions?.filter(q => q.id !== id)
        };
      } else {
        return {
          ...prev,
          sections: prev.sections?.filter(s => s.id !== id),
          questions: prev.questions?.map(q => q.section_id === id ? { ...q, section_id: null } : q)
        };
      }
    });

    if (selectedQuestionId === id || selectedSectionId === id) {
      setSelectedQuestionId(null);
      setSelectedSectionId(null);
    }

    try {
      let result;
      if (type === 'question') {
        result = await deleteQuestion(survey.id, id);
      } else {
        result = await deleteSection(survey.id, id);
      }

      if (result.error) throw result.error;
      setLastSaved(new Date());
    } catch (err: any) {
      setSaveError(err.message || "Failed to delete item");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateItem = async (type: 'question' | 'section', sectionId?: string) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      let result;
      if (type === 'question') {
        const newQuestion: Partial<SurveyQuestion> = {
          survey_id: survey.id,
          section_id: sectionId || null,
          type: 'short_text',
          title: 'New Question',
          is_required: true,
          order_index: (survey.questions || []).length
        };
        result = await saveQuestion(survey.id, newQuestion);
      } else {
        const newSection: Partial<SurveySection> = {
          survey_id: survey.id,
          title: 'New Section',
          order_index: (survey.sections || []).length
        };
        result = await saveSection(survey.id, newSection);
      }

      if (result.error) throw result.error;

      if (result.data) {
        setSurvey(prev => {
          if (type === 'question') {
            return { ...prev, questions: [...(prev.questions || []), result.data as SurveyQuestion] };
          } else {
            return { ...prev, sections: [...(prev.sections || []), result.data as SurveySection] };
          }
        });

        if (type === 'question') {
          handleSelectQuestion(result.data.id);
        } else {
          handleSelectSection(result.data.id);
        }
      }
      setLastSaved(new Date());
    } catch (err: any) {
      setSaveError(err.message || "Failed to create item");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicateItem = async (type: 'question' | 'section', id: string) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      let result;
      if (type === 'question') {
        const questionToDup = survey.questions?.find(q => q.id === id);
        if (!questionToDup) return;

        const { id: _, options, created_at, updated_at, ...qData } = questionToDup as any;
        result = await saveQuestion(survey.id, {
          ...qData,
          title: `${qData.title} (Copy)`,
          order_index: (survey.questions || []).length
        });

        if (result.data && options) {
          const newOptions = [];
          for (const opt of options) {
            const { id: __, created_at: ___, updated_at: ____, ...oData } = opt;
            const oResult = await saveOption(result.data.id, oData);
            if (oResult.data) newOptions.push(oResult.data);
          }
          result.data.options = newOptions;
        }
      } else {
        const sectionToDup = survey.sections?.find(s => s.id === id);
        if (!sectionToDup) return;

        const { id: _, created_at, updated_at, ...sData } = sectionToDup as any;
        result = await saveSection(survey.id, {
          ...sData,
          title: `${sData.title} (Copy)`,
          order_index: (survey.sections || []).length
        });
      }

      if (result.error) throw result.error;

      if (result.data) {
        setSurvey(prev => {
          if (type === 'question') {
            return { ...prev, questions: [...(prev.questions || []), result.data as SurveyQuestion] };
          } else {
            return { ...prev, sections: [...(prev.sections || []), result.data as SurveySection] };
          }
        });
        if (type === 'question') handleSelectQuestion(result.data.id);
        else handleSelectSection(result.data.id);
      }
      setLastSaved(new Date());
    } catch (err: any) {
      setSaveError(err.message || "Failed to duplicate item");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorderItems = async (type: 'question' | 'section', reorderedIds: string[]) => {
    setIsSaving(true);
    setSaveError(null);

    setSurvey(prev => {
      if (type === 'question') {
        const reorderedQuestions = [...(prev.questions || [])].sort((a, b) => {
          return reorderedIds.indexOf(a.id) - reorderedIds.indexOf(b.id);
        });
        return { ...prev, questions: reorderedQuestions };
      } else {
        const reorderedSections = [...(prev.sections || [])].sort((a, b) => {
          return reorderedIds.indexOf(a.id) - reorderedIds.indexOf(b.id);
        });
        return { ...prev, sections: reorderedSections };
      }
    });

    try {
      let result;
      if (type === 'question') {
        result = await reorderQuestions(survey.id, reorderedIds);
      } else {
        result = await reorderSections(survey.id, reorderedIds);
      }
      if (result?.error) throw result.error;
      setLastSaved(new Date());
    } catch (err: any) {
      setSaveError(err.message || "Failed to reorder items");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddOption = async (questionId: string) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const question = survey.questions?.find(q => q.id === questionId);
      const newOption: Partial<SurveyOption> = {
        question_id: questionId,
        text: 'New Option',
        order_index: (question?.options || []).length
      };

      const result = await saveOption(questionId, newOption);
      if (result.error) throw result.error;

      if (result.data) {
        setSurvey(prev => ({
          ...prev,
          questions: prev.questions?.map(q =>
            q.id === questionId
              ? { ...q, options: [...(q.options || []), result.data as SurveyOption] }
              : q
          )
        }));
      }
      setLastSaved(new Date());
    } catch (err: any) {
      setSaveError(err.message || "Failed to add option");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateOption = async (questionId: string, optionId: string, text: string) => {
    // Optimistic Update
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions?.map(q =>
        q.id === questionId
          ? { ...q, options: q.options?.map(o => o.id === optionId ? { ...o, text } : o) }
          : q
      )
    }));

    // For options, we could also debounce but let's keep it simple for now or use the same mechanism
    try {
      const result = await saveOption(questionId, { id: optionId, text });
      if (result.error) throw result.error;
      setLastSaved(new Date());
    } catch (err: any) {
      setSaveError(err.message || "Failed to update option");
    }
  };

  const handleDeleteOption = async (questionId: string, optionId: string) => {
    setIsSaving(true);
    setSaveError(null);

    setSurvey(prev => ({
      ...prev,
      questions: prev.questions?.map(q =>
        q.id === questionId
          ? { ...q, options: q.options?.filter(o => o.id !== optionId) }
          : q
      )
    }));

    try {
      const result = await deleteOption(questionId, optionId);
      if (result.error) throw result.error;
      setLastSaved(new Date());
    } catch (err: any) {
      setSaveError(err.message || "Failed to delete option");
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
              onCreateItem={handleCreateItem}
              onReorderSections={(ids) => handleReorderItems('section', ids)}
            />
          </div>
        </motion.aside>

        {/* Center Panel: Builder Canvas */}
        <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${activeMode !== 'canvas' && 'hidden md:flex'}`}>
          <div className="flex-1 overflow-y-auto custom-scrollbar rounded-[2.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-sm">
             <BuilderCanvas
               survey={survey}
               selectedQuestionId={selectedQuestionId}
               selectedSectionId={selectedSectionId}
               onSelectQuestion={handleSelectQuestion}
               onUpdateQuestion={(id, updates) => handleUpdateItem('question', id, updates)}
               onDeleteQuestion={(id) => handleDeleteItem('question', id)}
               onCreateQuestion={(sectionId) => handleCreateItem('question', sectionId)}
               onReorderQuestions={(ids) => handleReorderItems('question', ids)}
               onAddOption={handleAddOption}
               onUpdateOption={handleUpdateOption}
               onDeleteOption={handleDeleteOption}
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
              onDuplicate={handleDuplicateItem}
              onAddOption={handleAddOption}
              onUpdateOption={handleUpdateOption}
              onDeleteOption={handleDeleteOption}
            />
          </div>
        </motion.aside>

        {/* Mobile Views */}
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
                  onCreateItem={handleCreateItem}
                  onReorderSections={(ids) => handleReorderItems('section', ids)}
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
                  selectedQuestionId={selectedQuestionId}
                  selectedSectionId={selectedSectionId}
                  onSelectQuestion={handleSelectQuestion}
                  onUpdateQuestion={(id, updates) => handleUpdateItem('question', id, updates)}
                  onDeleteQuestion={(id) => handleDeleteItem('question', id)}
                  onCreateQuestion={(sectionId) => handleCreateItem('question', sectionId)}
                  onReorderQuestions={(ids) => handleReorderItems('question', ids)}
                  onAddOption={handleAddOption}
                  onUpdateOption={handleUpdateOption}
                  onDeleteOption={handleDeleteOption}
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
                  onDuplicate={handleDuplicateItem}
                  onAddOption={handleAddOption}
                  onUpdateOption={handleUpdateOption}
                  onDeleteOption={handleDeleteOption}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sync Status Overlay */}
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
                {lastSaved ? `Synced ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Saved'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
