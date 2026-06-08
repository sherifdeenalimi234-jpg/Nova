"use client";

import React from 'react';
import { SurveyQuestion } from '@/lib/types/surveys';

interface QuestionBaseProps {
  question: Partial<SurveyQuestion>;
  onChange: (updates: Partial<SurveyQuestion>) => void;
  isEditing?: boolean;
}

export function TextQuestion({ question, onChange, isEditing }: QuestionBaseProps) {
  const isLong = question.type === 'long_text';

  return (
    <div className="space-y-4">
      {isLong ? (
        <textarea
          disabled
          placeholder={question.placeholder || "Long text response area..."}
          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm min-h-[120px] resize-none opacity-50 cursor-not-allowed"
        />
      ) : (
        <input
          disabled
          type="text"
          placeholder={question.placeholder || "Short text response area..."}
          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm opacity-50 cursor-not-allowed"
        />
      )}

      {isEditing && (
        <div className="pt-4 border-t border-white/5 space-y-4">
           <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Placeholder Text</label>
              <input
                type="text"
                value={question.placeholder || ''}
                onChange={(e) => onChange({ placeholder: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-nova-cyan/50 focus:ring-0 transition-all"
                placeholder="e.g. Enter your feedback..."
              />
           </div>
        </div>
      )}
    </div>
  );
}

export function NumberQuestion({ question, onChange, isEditing }: QuestionBaseProps) {
  return (
    <div className="space-y-4">
      <input
        disabled
        type="number"
        placeholder={question.placeholder || "Numerical response..."}
        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm opacity-50 cursor-not-allowed"
      />

      {isEditing && (
        <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
           <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Min Value</label>
              <input
                type="number"
                value={question.validation_rules?.min ?? ''}
                onChange={(e) => onChange({
                  validation_rules: { ...question.validation_rules, min: e.target.value }
                })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold"
              />
           </div>
           <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Max Value</label>
              <input
                type="number"
                value={question.validation_rules?.max ?? ''}
                onChange={(e) => onChange({
                  validation_rules: { ...question.validation_rules, max: e.target.value }
                })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold"
              />
           </div>
        </div>
      )}
    </div>
  );
}
