"use client";

import React from 'react';
import { SurveyQuestion, SurveyOption } from '@/lib/types/surveys';
import {
  Plus,
  Trash2,
  Circle,
  CircleDot,
  Square,
  CheckSquare,
  Star,
  Calendar as CalendarIcon,
  ChevronDown
} from 'lucide-react';

interface QuestionBaseProps {
  question: Partial<SurveyQuestion>;
  onChange: (updates: Partial<SurveyQuestion>) => void;
  isEditing?: boolean;
}

export function ChoiceQuestion({ question, onChange, isEditing }: QuestionBaseProps) {
  const isMultiple = question.type === 'multiple_choice';
  const options = question.options || [];

  const handleAddOption = () => {
    const newOption: Partial<SurveyOption> = {
      id: `temp-${Date.now()}`,
      text: `Option ${options.length + 1}`,
      order_index: options.length
    };
    onChange({ options: [...options, newOption as SurveyOption] });
  };

  const handleUpdateOption = (id: string, text: string) => {
    const updated = options.map(o => o.id === id ? { ...o, text } : o);
    onChange({ options: updated });
  };

  const handleDeleteOption = (id: string) => {
    const updated = options.filter(o => o.id !== id);
    onChange({ options: updated });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {options.map((opt) => (
          <div key={opt.id} className="flex items-center gap-4 group/opt">
             <div className="text-white/20">
                {isMultiple ? <Square size={16} /> : <Circle size={16} />}
             </div>
             <input
               disabled={!isEditing}
               value={opt.text}
               onChange={(e) => handleUpdateOption(opt.id, e.target.value)}
               className={`flex-1 bg-transparent border-none p-0 text-sm font-medium focus:ring-0 transition-all ${
                 isEditing ? 'text-white' : 'text-white/40'
               }`}
             />
             {isEditing && options.length > 1 && (
               <button
                 onClick={() => handleDeleteOption(opt.id)}
                 className="opacity-0 group-hover/opt:opacity-100 text-white/20 hover:text-red-500 transition-all"
               >
                  <Trash2 size={14} />
               </button>
             )}
          </div>
        ))}
      </div>

      {isEditing && (
        <button
          onClick={handleAddOption}
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-nova-cyan transition-all"
        >
           <Plus size={14} />
           <span>Add Option</span>
        </button>
      )}
    </div>
  );
}

export function RatingQuestion({ question, onChange, isEditing }: QuestionBaseProps) {
  const max = question.validation_rules?.max || 5;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {[...Array(max)].map((_, i) => (
          <div key={i} className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20">
             <Star size={20} />
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="pt-4 border-t border-white/5 flex items-center gap-8">
           <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Scale Points (Max 10)</label>
              <div className="flex items-center gap-3">
                 <input
                   type="range"
                   min="3"
                   max="10"
                   value={max}
                   onChange={(e) => onChange({
                     validation_rules: { ...question.validation_rules, max: parseInt(e.target.value) }
                   })}
                   className="w-32 accent-nova-green"
                 />
                 <span className="text-xs font-black text-nova-green">{max}</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export function YesNoQuestion({ question, onChange, isEditing }: QuestionBaseProps) {
  return (
    <div className="flex items-center gap-4">
       {['Yes', 'No'].map((val) => (
         <div key={val} className="px-8 py-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3 text-white/20">
            <Circle size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">{val}</span>
         </div>
       ))}
    </div>
  );
}

export function DateQuestion({ question, onChange, isEditing }: QuestionBaseProps) {
  return (
    <div className="p-6 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-white/20">
       <span className="text-sm font-medium">Select Date...</span>
       <CalendarIcon size={18} />
    </div>
  );
}

export function DropdownQuestion({ question, onChange, isEditing }: QuestionBaseProps) {
  return (
    <div className="p-6 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-white/20">
       <span className="text-sm font-medium">Select an option...</span>
       <ChevronDown size={18} />
    </div>
  );
}
