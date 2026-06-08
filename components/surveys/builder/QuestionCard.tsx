"use client";

import { useState, useEffect } from 'react';
import { SurveyQuestion, QuestionType, SurveyOption } from '@/lib/types/surveys';
import {
  Trash2,
  Copy,
  GripVertical,
  ChevronDown,
  Plus,
  X,
  Type,
  AlignLeft,
  CircleDot,
  CheckSquare,
  List,
  Star,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface QuestionCardProps {
  question: SurveyQuestion;
  onUpdate: (id: string, updates: Partial<SurveyQuestion>) => void;
  onDelete: (id: string) => void;
  onAddOption: (questionId: string) => void;
  onUpdateOption: (questionId: string, optionId: string, text: string) => void;
  onDeleteOption: (questionId: string, optionId: string) => void;
  onSelect: () => void;
}

const QUESTION_TYPES: { type: QuestionType; label: string; icon: any }[] = [
  { type: 'short_text', label: 'Short Text', icon: Type },
  { type: 'long_text', label: 'Long Text', icon: AlignLeft },
  { type: 'single_choice', label: 'Single Choice', icon: CircleDot },
  { type: 'multiple_choice', label: 'Multiple Choice', icon: CheckSquare },
  { type: 'dropdown', label: 'Dropdown', icon: List },
  { type: 'rating', label: 'Rating', icon: Star },
];

export default function QuestionCard({
  question,
  onUpdate,
  onDelete,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  onSelect
}: QuestionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  const [showTypeSelector, setShowTypeSelector] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className="group relative bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden mb-4 hover:border-white/10 transition-all cursor-pointer"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing text-white/10 hover:text-white/40 transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="pl-10 p-6 space-y-4">
        {/* Type & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTypeSelector(!showTypeSelector);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/40 transition-colors"
            >
              {QUESTION_TYPES.find(t => t.type === question.type)?.label}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <AnimatePresence>
              {showTypeSelector && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTypeSelector(false);
                    }}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl z-20 py-1 overflow-hidden"
                  >
                    {QUESTION_TYPES.map((t) => (
                      <button
                        key={t.type}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdate(question.id, { type: t.type });
                          setShowTypeSelector(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-left hover:bg-white/5 transition-colors ${
                          question.type === t.type ? 'text-nova-cyan bg-nova-cyan/5' : 'text-white/60'
                        }`}
                      >
                        <t.icon className="w-4 h-4" />
                        <span className="uppercase tracking-widest">{t.label}</span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center gap-2 mr-4 pr-4 border-r border-white/5">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Required</span>
              <button
                onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(question.id, { is_required: !question.is_required });
                }}
                className={`w-8 h-4 rounded-full relative transition-colors ${
                  question.is_required ? 'bg-nova-purple' : 'bg-white/10'
                }`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                  question.is_required ? 'left-4.5' : 'left-0.5'
                }`} />
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(question.id);
              }}
              className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="p-2 text-white/20 hover:text-white transition-all">
                <Settings2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Question Title */}
        <input
          type="text"
          value={question.title}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onUpdate(question.id, { title: e.target.value })}
          placeholder="Untitled Question"
          className="w-full bg-transparent text-lg font-black text-white placeholder-white/10 focus:outline-none uppercase tracking-tight"
        />

        {/* Description */}
        <textarea
          value={question.description || ''}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onUpdate(question.id, { description: e.target.value })}
          placeholder="Add helper text (optional)"
          rows={1}
          className="w-full bg-transparent text-sm text-white/40 placeholder-white/10 focus:outline-none resize-none font-medium"
        />

        {/* Options Management (if applicable) */}
        {['single_choice', 'multiple_choice', 'dropdown'].includes(question.type) && (
          <div className="space-y-2 pt-2">
            {(question.options || []).map((option) => (
              <div key={option.id} className="flex items-center gap-2 group/option">
                <div className="w-4 h-4 rounded-full border border-white/10 flex-shrink-0" />
                <input
                  type="text"
                  value={option.text}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onUpdateOption(question.id, option.id, e.target.value)}
                  placeholder="Option text"
                  className="flex-1 bg-transparent text-sm text-white/60 focus:outline-none py-1 font-medium"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteOption(question.id, option.id);
                  }}
                  className="p-1.5 text-white/20 hover:text-white opacity-0 group-hover/option:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddOption(question.id);
              }}
              className="flex items-center gap-2 text-[10px] text-nova-cyan font-black uppercase tracking-widest hover:text-white transition-colors pt-2"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </button>
          </div>
        )}

        {/* Rating specific UI */}
        {question.type === 'rating' && (
          <div className="flex gap-2 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20">
                <Star className="w-5 h-5" />
              </div>
            ))}
          </div>
        )}

        {/* Text specific UI */}
        {['short_text', 'long_text'].includes(question.type) && (
          <div className="pt-2">
            <div className="w-full bg-white/[0.02] border border-white/5 border-dashed rounded-xl px-4 py-3 text-[10px] text-white/20 uppercase font-black tracking-widest">
                User input area
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
