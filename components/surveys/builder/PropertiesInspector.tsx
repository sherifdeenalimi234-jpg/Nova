"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Survey, SurveyQuestion, SurveySection, QuestionType, SurveyOption } from '@/lib/types/surveys';
import {
  Settings2,
  Info,
  AlertCircle,
  Trash2,
  Copy,
  Eye,
  Lock,
  Zap,
  Layout,
  Type,
  AlignLeft,
  CircleDot,
  CheckSquare,
  List,
  Star,
  Plus,
  X,
  ChevronDown,
  Calendar,
  ToggleLeft,
  Mail,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PropertiesInspectorProps {
  survey: Survey;
  selectedQuestionId: string | null;
  selectedSectionId: string | null;
  onUpdate: (type: 'question' | 'section', id: string, updates: any) => void;
  onDelete: (type: 'question' | 'section', id: string) => void;
  onDuplicate: (type: 'question' | 'section', id: string) => void;
  onAddOption: (questionId: string) => void;
  onUpdateOption: (questionId: string, optionId: string, text: string) => void;
  onDeleteOption: (questionId: string, optionId: string) => void;
}

const QUESTION_TYPES: { type: QuestionType; label: string; icon: any }[] = [
  { type: 'short_text', label: 'Short Text', icon: Type },
  { type: 'long_text', label: 'Long Text', icon: AlignLeft },
  { type: 'single_choice', label: 'Single Choice', icon: CircleDot },
  { type: 'multiple_choice', label: 'Multiple Choice', icon: CheckSquare },
  { type: 'dropdown', label: 'Dropdown', icon: List },
  { type: 'rating', label: 'Rating', icon: Star },
  { type: 'yes_no', label: 'Yes/No', icon: ToggleLeft },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'number', label: 'Number', icon: Hash },
];

export default function PropertiesInspector({
  survey,
  selectedQuestionId,
  selectedSectionId,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddOption,
  onUpdateOption,
  onDeleteOption
}: PropertiesInspectorProps) {

  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const selectedQuestion = survey.questions?.find(q => q.id === selectedQuestionId);
  const selectedSection = survey.sections?.find(s => s.id === selectedSectionId);

  // Local state for debounced inputs
  const [localTitle, setLocalTitle] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const titleDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const descDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalTitle(selectedQuestion?.title || selectedSection?.title || '');
    setLocalDescription(selectedQuestion?.description || selectedSection?.description || '');
  }, [selectedQuestionId, selectedSectionId]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalTitle(value);

    if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
    titleDebounceRef.current = setTimeout(() => {
        if (selectedQuestion) {
            onUpdate('question', selectedQuestion.id, { title: value });
        } else if (selectedSection) {
            onUpdate('section', selectedSection.id, { title: value });
        }
    }, 500);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalDescription(value);

    if (descDebounceRef.current) clearTimeout(descDebounceRef.current);
    descDebounceRef.current = setTimeout(() => {
        if (selectedQuestion) {
            onUpdate('question', selectedQuestion.id, { description: value });
        } else if (selectedSection) {
            onUpdate('section', selectedSection.id, { description: value });
        }
    }, 500);
  };

  const handleToggleRequired = () => {
    if (selectedQuestion) {
      onUpdate('question', selectedQuestion.id, { is_required: !selectedQuestion.is_required });
    }
  };

  const handleDelete = () => {
    if (selectedQuestion) {
      onDelete('question', selectedQuestion.id);
    } else if (selectedSection) {
      onDelete('section', selectedSection.id);
    }
  };

  const handleDuplicate = () => {
    if (selectedQuestion) {
      onDuplicate('question', selectedQuestion.id);
    } else if (selectedSection) {
      onDuplicate('section', selectedSection.id);
    }
  };

  const handleTypeChange = (type: QuestionType) => {
    if (selectedQuestion) {
      onUpdate('question', selectedQuestion.id, { type });
      setShowTypeSelector(false);
    }
  };

  const handleValidationRuleChange = (key: string, value: any) => {
    if (selectedQuestion) {
      const currentRules = selectedQuestion.validation_rules || {};
      onUpdate('question', selectedQuestion.id, {
        validation_rules: { ...currentRules, [key]: value }
      });
    }
  };

  if (!selectedQuestion && !selectedSection) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-6">
        <div className="w-20 h-20 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/10">
          <Settings2 size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Inspector Idle</h3>
          <p className="text-[10px] text-white/20 uppercase font-bold leading-relaxed max-w-[200px]">
            Select a question or section on the map to modify its properties.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Inspector Header */}
      <div className="p-8 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-nova-purple/10 flex items-center justify-center text-nova-purple">
            {selectedQuestion ? <Type size={20} /> : <Layout size={20} />}
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest">
              {selectedQuestion ? 'Question Properties' : 'Section Properties'}
            </h3>
            <p className="text-[9px] text-white/20 font-black uppercase tracking-tighter">
              Node ID: {selectedQuestion?.id.slice(0, 8) || selectedSection?.id.slice(0, 8)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDuplicate}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest transition-all"
          >
            <Copy size={12} />
            <span>Duplicate</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest transition-all"
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

        {/* Question Type Selector (Question only) */}
        {selectedQuestion && (
          <div className="space-y-4">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 px-1">Structure</label>
            <div className="relative">
              <button
                onClick={() => setShowTypeSelector(!showTypeSelector)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-center gap-3 text-white/60">
                  {QUESTION_TYPES.find(t => t.type === selectedQuestion.type)?.icon({ size: 16 })}
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {QUESTION_TYPES.find(t => t.type === selectedQuestion.type)?.label}
                  </span>
                </div>
                <ChevronDown size={14} className="text-white/20" />
              </button>

              <AnimatePresence>
                {showTypeSelector && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowTypeSelector(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden"
                    >
                      {QUESTION_TYPES.map((t) => (
                        <button
                          key={t.type}
                          onClick={() => handleTypeChange(t.type)}
                          className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-white/5 transition-colors ${
                            selectedQuestion.type === t.type ? 'text-nova-cyan bg-nova-cyan/5' : 'text-white/60'
                          }`}
                        >
                          <t.icon size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Title & Description */}
        <div className="space-y-4">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 px-1">Identification</label>
          <div className="space-y-3">
             <div className="space-y-1.5">
                <span className="text-[8px] font-black uppercase text-white/20 pl-4">Title</span>
                <input
                  type="text"
                  value={localTitle}
                  onChange={handleTitleChange}
                  placeholder="Enter title..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-xs font-medium focus:outline-none focus:border-nova-purple/50 transition-all placeholder:text-white/10"
                />
             </div>
             <div className="space-y-1.5">
                <span className="text-[8px] font-black uppercase text-white/20 pl-4">Description</span>
                <textarea
                  rows={3}
                  value={localDescription}
                  onChange={handleDescriptionChange}
                  placeholder="Additional context (optional)..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-xs font-medium focus:outline-none focus:border-nova-purple/50 transition-all resize-none placeholder:text-white/10"
                />
             </div>
          </div>
        </div>

        {selectedQuestion && (
          <>
            {/* Options Management (Choice Questions) */}
            {['single_choice', 'multiple_choice', 'dropdown'].includes(selectedQuestion.type) && (
              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 px-1">Options</label>
                <div className="space-y-2">
                  {(selectedQuestion.options || []).map((option) => (
                    <div key={option.id} className="flex items-center gap-2 group/opt">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => onUpdateOption(selectedQuestion.id, option.id, e.target.value)}
                        placeholder="Option text..."
                        className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-[11px] font-medium focus:outline-none focus:border-nova-cyan/50 transition-all"
                      />
                      <button
                        onClick={() => onDeleteOption(selectedQuestion.id, option.id)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => onAddOption(selectedQuestion.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all"
                  >
                    <Plus size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Add Option</span>
                  </button>
                </div>
              </div>
            )}

            {/* Logic & Validation */}
            <div className="space-y-4">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 px-1">Logic & Validation</label>
              <div className="space-y-3">
                 <div
                    onClick={handleToggleRequired}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10 cursor-pointer hover:bg-white/[0.05] transition-all"
                 >
                    <div className="flex items-center gap-3">
                       <Lock size={14} className={selectedQuestion?.is_required ? "text-nova-purple" : "text-white/20"} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Required Field</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${selectedQuestion?.is_required ? 'bg-nova-purple' : 'bg-white/10'}`}>
                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${selectedQuestion?.is_required ? 'right-1' : 'left-1'}`} />
                    </div>
                 </div>

                 {/* Validation Rules */}
                 <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4">
                    <div className="flex items-center gap-2 text-nova-cyan opacity-40">
                       <Zap size={12} />
                       <span className="text-[8px] font-black uppercase tracking-widest">Validation Rules</span>
                    </div>

                    {['short_text', 'long_text'].includes(selectedQuestion.type) && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <span className="text-[8px] font-black text-white/20 ml-2">Min Char</span>
                          <input
                            type="number"
                            value={selectedQuestion.validation_rules?.min_length || ''}
                            onChange={(e) => handleValidationRuleChange('min_length', parseInt(e.target.value) || 0)}
                            className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none focus:border-nova-cyan/30 transition-all"
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[8px] font-black text-white/20 ml-2">Max Char</span>
                          <input
                            type="number"
                            value={selectedQuestion.validation_rules?.max_length || ''}
                            onChange={(e) => handleValidationRuleChange('max_length', parseInt(e.target.value) || 0)}
                            className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none focus:border-nova-cyan/30 transition-all"
                            placeholder="Unlimited"
                          />
                        </div>
                      </div>
                    )}

                    {selectedQuestion.type === 'rating' && (
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-black text-white/20 ml-2">Scale (Max)</span>
                        <select
                          value={selectedQuestion.validation_rules?.max_rating || 5}
                          onChange={(e) => handleValidationRuleChange('max_rating', parseInt(e.target.value))}
                          className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-[10px] text-white/60 outline-none"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                        </select>
                      </div>
                    )}

                    {selectedQuestion.type === 'number' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <span className="text-[8px] font-black text-white/20 ml-2">Min Value</span>
                          <input
                            type="number"
                            value={selectedQuestion.validation_rules?.min_value || ''}
                            onChange={(e) => handleValidationRuleChange('min_value', parseFloat(e.target.value) || 0)}
                            className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none focus:border-nova-cyan/30 transition-all"
                            placeholder="Min"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[8px] font-black text-white/20 ml-2">Max Value</span>
                          <input
                            type="number"
                            value={selectedQuestion.validation_rules?.max_value || ''}
                            onChange={(e) => handleValidationRuleChange('max_value', parseFloat(e.target.value) || 0)}
                            className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none focus:border-nova-cyan/30 transition-all"
                            placeholder="Max"
                          />
                        </div>
                      </div>
                    )}

                    <p className="text-[8px] text-white/20 uppercase font-bold text-center">Advanced rules coming soon</p>
                 </div>
              </div>
            </div>
          </>
        )}

      </div>

      {/* Inspector Footer */}
      <div className="p-8 border-t border-white/5 bg-black/40">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-nova-cyan/10 border border-nova-cyan/20">
          <AlertCircle size={16} className="text-nova-cyan flex-shrink-0" />
          <p className="text-[9px] font-bold text-nova-cyan leading-tight uppercase tracking-tight">
            All changes are synchronized in real-time with the central intelligence node.
          </p>
        </div>
      </div>
    </div>
  );
}
