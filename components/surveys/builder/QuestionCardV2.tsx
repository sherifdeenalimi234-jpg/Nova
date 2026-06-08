"use client";

import React from 'react';
import {
  Trash2,
  GripVertical,
  Settings2,
  ChevronDown,
  ChevronUp,
  Copy,
  AlertCircle,
  Hash,
  Type,
  CheckSquare,
  CircleDot,
  Star,
  ToggleLeft,
  Calendar,
  ChevronDownSquare,
  Asterisk
} from 'lucide-react';
import { SurveyQuestion, QuestionType } from '@/lib/types/surveys';
import { motion, AnimatePresence } from 'framer-motion';
import { TextQuestion, NumberQuestion } from './questions/TextNumberQuestions';
import { ChoiceQuestion, RatingQuestion, YesNoQuestion, DateQuestion, DropdownQuestion } from './questions/ChoiceRatingQuestions';

interface QuestionCardProps {
  question: Partial<SurveyQuestion>;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<SurveyQuestion>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const QUESTION_TYPES: { type: QuestionType; label: string; icon: any; color: string }[] = [
  { type: 'short_text', label: 'Short Text', icon: Type, color: 'text-nova-cyan' },
  { type: 'long_text', label: 'Long Text', icon: Type, color: 'text-nova-cyan' },
  { type: 'single_choice', label: 'Single Choice', icon: CircleDot, color: 'text-nova-purple' },
  { type: 'multiple_choice', label: 'Multiple Choice', icon: CheckSquare, color: 'text-nova-purple' },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDownSquare, color: 'text-nova-purple' },
  { type: 'rating', label: 'Rating Scale', icon: Star, color: 'text-nova-green' },
  { type: 'yes_no', label: 'Yes / No', icon: ToggleLeft, color: 'text-nova-green' },
  { type: 'date', label: 'Date', icon: Calendar, color: 'text-nova-cyan' },
  { type: 'number', label: 'Number', icon: Hash, color: 'text-nova-cyan' },
];

export function QuestionCard({
  question,
  index,
  isActive,
  onSelect,
  onChange,
  onDelete,
  onDuplicate
}: QuestionCardProps) {

  const activeType = QUESTION_TYPES.find(t => t.type === question.type) || QUESTION_TYPES[0];
  const Icon = activeType.icon;

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'short_text':
      case 'long_text':
        return <TextQuestion question={question} onChange={onChange} isEditing={isActive} />;
      case 'number':
        return <NumberQuestion question={question} onChange={onChange} isEditing={isActive} />;
      case 'single_choice':
      case 'multiple_choice':
        return <ChoiceQuestion question={question} onChange={onChange} isEditing={isActive} />;
      case 'dropdown':
        return <DropdownQuestion question={question} onChange={onChange} isEditing={isActive} />;
      case 'rating':
        return <RatingQuestion question={question} onChange={onChange} isEditing={isActive} />;
      case 'yes_no':
        return <YesNoQuestion question={question} onChange={onChange} isEditing={isActive} />;
      case 'date':
        return <DateQuestion question={question} onChange={onChange} isEditing={isActive} />;
      default:
        return (
          <div className="p-8 border border-dashed border-white/5 rounded-2xl bg-white/[0.01] text-center">
             <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Component for {question.type} coming soon</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      layout
      onClick={onSelect}
      className={`group relative rounded-[2.5rem] transition-all border ${
        isActive
        ? 'bg-gradient-to-br from-white/[0.04] to-transparent border-nova-cyan/50 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(0,242,255,0.05)]'
        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
      }`}
    >
      {/* Active Indicator & Drag Handle */}
      <div className="absolute left-4 top-10 bottom-10 w-1 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
         <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
         <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
         <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
      </div>

      <div className="p-8 lg:p-10 space-y-8">
        {/* Header: Type & Actions */}
        <div className="flex items-start justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${activeType.color} border border-white/5`}>
                 <Icon size={18} />
              </div>
              <div>
                 <div className="flex items-center gap-2 mb-1">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Question {index + 1}</span>
                    {question.is_required && <Asterisk size={10} className="text-nova-purple" />}
                 </div>
                 <div className="flex items-center gap-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest">{activeType.label}</h3>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all" title="Duplicate">
                 <Copy size={14} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all" title="Delete">
                 <Trash2 size={14} />
              </button>
           </div>
        </div>

        {/* Question Title & Description */}
        <div className="space-y-4">
           <input
             value={question.title || ''}
             onChange={(e) => onChange({ title: e.target.value })}
             placeholder="Enter your question here..."
             className={`w-full bg-transparent border-none p-0 text-xl lg:text-2xl font-black tracking-tight placeholder:text-white/5 focus:ring-0 transition-all ${
               !question.title && isActive ? 'animate-pulse' : ''
             }`}
           />
           <textarea
             value={question.description || ''}
             onChange={(e) => onChange({ description: e.target.value })}
             placeholder="Add an optional description or instruction..."
             rows={1}
             className="w-full bg-transparent border-none p-0 text-[11px] lg:text-xs text-white/40 uppercase font-medium tracking-wide placeholder:text-white/5 focus:ring-0 resize-none overflow-hidden"
           />
        </div>

        {/* Specific Question Type Content */}
        <div className="relative">
           {renderQuestionContent()}
        </div>

        {/* Footer Settings Bar (Only when active) */}
        <AnimatePresence>
           {isActive && (
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 10 }}
               className="pt-8 border-t border-white/5 flex items-center justify-between"
             >
                <div className="flex items-center gap-6">
                   <button
                     onClick={() => onChange({ is_required: !question.is_required })}
                     className="flex items-center gap-2 group/opt"
                   >
                      <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                        question.is_required ? 'bg-nova-purple border-nova-purple' : 'bg-white/5 border-white/10 group-hover/opt:border-white/20'
                      }`}>
                         {question.is_required && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/60 transition-colors">Required</span>
                   </button>
                </div>

                <div className="flex items-center gap-2">
                   <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase tracking-widest transition-all text-white/40 hover:text-white">
                      <Settings2 size={12} />
                      Advanced Settings
                   </button>
                </div>
             </motion.div>
           )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
