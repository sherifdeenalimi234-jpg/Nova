"use client";

import React from 'react';
import { Survey, SurveySection, SurveyQuestion } from '@/lib/types/surveys';
import {
  Layers,
  Plus,
  GripVertical,
  ChevronRight,
  Hash,
  Type,
  CheckCircle2,
  List,
  Star,
  Calendar,
  ToggleLeft,
  ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StructurePanelProps {
  survey: Survey;
  selectedQuestionId: string | null;
  selectedSectionId: string | null;
  onSelectQuestion: (id: string) => void;
  onSelectSection: (id: string) => void;
}

const getQuestionIcon = (type: string) => {
  switch (type) {
    case 'short_text': return <Type size={14} />;
    case 'long_text': return <List size={14} />;
    case 'single_choice': return <CheckCircle2 size={14} />;
    case 'multiple_choice': return <Layers size={14} />;
    case 'rating': return <Star size={14} />;
    case 'yes_no': return <ToggleLeft size={14} />;
    case 'date': return <Calendar size={14} />;
    case 'number': return <Hash size={14} />;
    case 'dropdown': return <ChevronDown size={14} />;
    default: return <Hash size={14} />;
  }
};

export default function StructurePanel({
  survey,
  selectedQuestionId,
  selectedSectionId,
  onSelectQuestion,
  onSelectSection
}: StructurePanelProps) {

  const sections = survey.sections || [];
  const questions = survey.questions || [];

  // Group questions by section
  const questionsBySection = questions.reduce((acc, q) => {
    const sectionId = q.section_id || 'root';
    if (!acc[sectionId]) acc[sectionId] = [];
    acc[sectionId].push(q);
    return acc;
  }, {} as Record<string, SurveyQuestion[]>);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-nova-purple/10 flex items-center justify-center text-nova-purple">
            <Layers size={16} />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Survey Map</h3>
        </div>
        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Root Questions (not in any section) */}
        {questionsBySection['root']?.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => onSelectQuestion(q.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative ${
              selectedQuestionId === q.id
              ? 'bg-nova-purple text-white shadow-lg'
              : 'bg-white/[0.03] hover:bg-white/[0.05] text-white/40 hover:text-white'
            }`}
          >
            <div className={`p-2 rounded-lg ${selectedQuestionId === q.id ? 'bg-white/20' : 'bg-white/5'}`}>
              {getQuestionIcon(q.type)}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[10px] font-bold truncate leading-none mb-1">
                {q.title || `Untitled Question ${idx + 1}`}
              </p>
              <p className={`text-[8px] uppercase tracking-widest font-black opacity-40`}>
                {q.type.replace('_', ' ')}
              </p>
            </div>
          </button>
        ))}

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.id} className="space-y-2">
            <button
              onClick={() => onSelectSection(section.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                selectedSectionId === section.id
                ? 'bg-nova-cyan text-black shadow-lg'
                : 'bg-white/[0.05] text-white/60'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <ChevronRight size={14} className={selectedSectionId === section.id ? '' : 'opacity-40'} />
                <span className="text-[10px] font-black uppercase tracking-widest truncate">{section.title || 'Untitled Section'}</span>
              </div>
              <span className="text-[9px] font-black opacity-40">{(questionsBySection[section.id] || []).length}</span>
            </button>

            {/* Questions within this section */}
            <div className="pl-6 space-y-2">
              {questionsBySection[section.id]?.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => onSelectQuestion(q.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group relative ${
                    selectedQuestionId === q.id
                    ? 'bg-nova-purple text-white shadow-md'
                    : 'bg-white/[0.02] hover:bg-white/[0.04] text-white/30 hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-md ${selectedQuestionId === q.id ? 'bg-white/20' : 'bg-white/5'}`}>
                    {getQuestionIcon(q.type)}
                  </div>
                  <span className="text-[9px] font-bold truncate flex-1 text-left">
                    {q.title || `Untitled Question ${idx + 1}`}
                  </span>
                </button>
              ))}

              <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10 text-white/20 hover:text-white/40 hover:border-white/20 transition-all">
                <Plus size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">Add to Section</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-white/5">
        <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all group">
          <Plus size={16} className="text-nova-purple group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">New Section</span>
        </button>
      </div>
    </div>
  );
}
