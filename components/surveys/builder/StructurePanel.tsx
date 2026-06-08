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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StructurePanelProps {
  survey: Survey;
  selectedQuestionId: string | null;
  selectedSectionId: string | null;
  onSelectQuestion: (id: string) => void;
  onSelectSection: (id: string) => void;
  onCreateItem: (type: 'question' | 'section', sectionId?: string) => void;
  onReorderSections: (ids: string[]) => void;
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

interface SortableSectionItemProps {
  section: SurveySection;
  selectedSectionId: string | null;
  selectedQuestionId: string | null;
  questions: SurveyQuestion[];
  onSelectSection: (id: string) => void;
  onSelectQuestion: (id: string) => void;
  onCreateQuestion: (sectionId: string) => void;
}

function SortableSectionItem({
  section,
  selectedSectionId,
  selectedQuestionId,
  questions,
  onSelectSection,
  onSelectQuestion,
  onCreateQuestion
}: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-2 group/section">
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-white/10 hover:text-white/40 transition-colors">
          <GripVertical size={14} />
        </div>
        <button
          onClick={() => onSelectSection(section.id)}
          className={`flex-1 flex items-center justify-between p-4 rounded-2xl transition-all ${
            selectedSectionId === section.id
            ? 'bg-nova-cyan text-black shadow-lg'
            : 'bg-white/[0.05] text-white/60'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <ChevronRight size={14} className={selectedSectionId === section.id ? '' : 'opacity-40'} />
            <span className="text-[10px] font-black uppercase tracking-widest truncate">{section.title || 'Untitled Section'}</span>
          </div>
          <span className="text-[9px] font-black opacity-40">{questions.length}</span>
        </button>
      </div>

      {/* Questions within this section */}
      <div className="pl-8 space-y-2">
        {questions.map((q, idx) => (
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

        <button
          onClick={() => onCreateQuestion(section.id)}
          className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10 text-white/20 hover:text-white/40 hover:border-white/20 transition-all"
        >
          <Plus size={12} />
          <span className="text-[9px] font-black uppercase tracking-widest">Add to Section</span>
        </button>
      </div>
    </div>
  );
}

export default function StructurePanel({
  survey,
  selectedQuestionId,
  selectedSectionId,
  onSelectQuestion,
  onSelectSection,
  onCreateItem,
  onReorderSections
}: StructurePanelProps) {

  const sections = survey.sections || [];
  const questions = survey.questions || [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over?.id);
      const newSections = arrayMove(sections, oldIndex, newIndex);
      onReorderSections(newSections.map(s => s.id));
    }
  };

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
        <button
          onClick={() => onCreateItem('question')}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
          title="Add Question to Root"
        >
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {sections.map((section) => (
                <SortableSectionItem
                  key={section.id}
                  section={section}
                  selectedSectionId={selectedSectionId}
                  selectedQuestionId={selectedQuestionId}
                  questions={questionsBySection[section.id] || []}
                  onSelectSection={onSelectSection}
                  onSelectQuestion={onSelectQuestion}
                  onCreateQuestion={(sid) => onCreateItem('question', sid)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="pt-8 border-t border-white/5">
        <button
          onClick={() => onCreateItem('section')}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all group"
        >
          <Plus size={16} className="text-nova-purple group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">New Section</span>
        </button>
      </div>
    </div>
  );
}
