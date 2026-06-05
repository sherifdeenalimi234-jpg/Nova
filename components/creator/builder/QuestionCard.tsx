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
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface QuestionCardProps {
  question: SurveyQuestion;
  onUpdate: (id: string, updates: Partial<SurveyQuestion>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
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
];

export default function QuestionCard({
  question,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddOption,
  onUpdateOption,
  onDeleteOption
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
      className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-4"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing text-zinc-700 hover:text-zinc-500 transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="pl-10 p-6 space-y-4">
        {/* Type & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative">
            <button
              onClick={() => setShowTypeSelector(!showTypeSelector)}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold text-zinc-300 transition-colors"
            >
              {QUESTION_TYPES.find(t => t.type === question.type)?.label}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <AnimatePresence>
              {showTypeSelector && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowTypeSelector(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl z-20 py-1 overflow-hidden"
                  >
                    {QUESTION_TYPES.map((t) => (
                      <button
                        key={t.type}
                        onClick={() => {
                          onUpdate(question.id, { type: t.type });
                          setShowTypeSelector(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-zinc-700 transition-colors ${
                          question.type === t.type ? 'text-cyan-400 bg-cyan-400/5' : 'text-zinc-300'
                        }`}
                      >
                        <t.icon className="w-4 h-4" />
                        {t.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center gap-2 mr-4 pr-4 border-r border-zinc-800">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Required</span>
              <button
                onClick={() => onUpdate(question.id, { is_required: !question.is_required })}
                className={`w-8 h-4 rounded-full relative transition-colors ${
                  question.is_required ? 'bg-cyan-500' : 'bg-zinc-700'
                }`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                  question.is_required ? 'left-4.5' : 'left-0.5'
                }`} />
              </button>
            </div>

            <button
              onClick={() => onDuplicate(question.id)}
              className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(question.id)}
              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question Title */}
        <input
          type="text"
          value={question.title}
          onChange={(e) => onUpdate(question.id, { title: e.target.value })}
          placeholder="Untitled Question"
          className="w-full bg-transparent text-lg font-bold text-white placeholder-zinc-700 focus:outline-none"
        />

        {/* Description */}
        <textarea
          value={question.description || ''}
          onChange={(e) => onUpdate(question.id, { description: e.target.value })}
          placeholder="Add helper text (optional)"
          rows={1}
          className="w-full bg-transparent text-sm text-zinc-500 placeholder-zinc-700 focus:outline-none resize-none"
        />

        {/* Options Management (if applicable) */}
        {['single_choice', 'multiple_choice', 'dropdown'].includes(question.type) && (
          <div className="space-y-2 pt-2">
            {(question.options || []).map((option) => (
              <div key={option.id} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-zinc-700 flex-shrink-0" />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => onUpdateOption(question.id, option.id, e.target.value)}
                  placeholder="Option text"
                  className="flex-1 bg-transparent text-sm text-zinc-300 focus:outline-none py-1"
                />
                <button
                  onClick={() => onDeleteOption(question.id, option.id)}
                  className="p-1.5 text-zinc-600 hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => onAddOption(question.id)}
              className="flex items-center gap-2 text-sm text-cyan-400/70 hover:text-cyan-400 font-medium transition-colors pt-2"
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
              <div key={i} className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500">
                <Star className="w-5 h-5" />
              </div>
            ))}
          </div>
        )}

        {/* Text specific UI */}
        {['short_text', 'long_text'].includes(question.type) && (
          <div className="pt-2">
            <input
              type="text"
              value={question.placeholder || ''}
              onChange={(e) => onUpdate(question.id, { placeholder: e.target.value })}
              placeholder="Custom placeholder text..."
              className="w-full bg-zinc-800/50 border border-zinc-800 border-dashed rounded-xl px-4 py-3 text-sm text-zinc-500 italic focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
