"use client";

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
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Plus, MessageSquare, Layout } from 'lucide-react';
import QuestionCard from './QuestionCard';
import { SurveyQuestion, SurveySection } from '@/lib/types/surveys';

interface QuestionListProps {
  surveyId: string;
  questions: SurveyQuestion[];
  sections: SurveySection[];
  selectedSectionId: string | null;
  onSelectQuestion: (id: string) => void;
  onUpdateQuestion: (id: string, updates: Partial<SurveyQuestion>) => void;
  onDeleteQuestion: (id: string) => void;
  onCreateQuestion: (sectionId?: string) => void;
  onReorderQuestions: (ids: string[]) => void;
  onAddOption: (questionId: string) => void;
  onUpdateOption: (questionId: string, optionId: string, text: string) => void;
  onDeleteOption: (questionId: string, optionId: string) => void;
}

export default function QuestionList({
  surveyId,
  questions,
  sections,
  selectedSectionId,
  onSelectQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onCreateQuestion,
  onReorderQuestions,
  onAddOption,
  onUpdateOption,
  onDeleteOption
}: QuestionListProps) {

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = questions.findIndex((i) => i.id === active.id);
      const newIndex = questions.findIndex((i) => i.id === over?.id);
      const newItems = arrayMove(questions, oldIndex, newIndex);
      onReorderQuestions(newItems.map(q => q.id));
    }
  };

  // Filter questions by selected section if applicable
  const displayQuestions = selectedSectionId
    ? questions.filter(q => q.section_id === selectedSectionId)
    : questions;

  const currentSection = sections.find(s => s.id === selectedSectionId);

  return (
    <div className="space-y-6 pb-32">
      {selectedSectionId && (
        <div className="mb-8 p-6 rounded-3xl bg-nova-cyan/5 border border-nova-cyan/10">
          <div className="flex items-center gap-3 text-nova-cyan mb-2">
            <Layout size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Viewing Section</span>
          </div>
          <h3 className="text-xl font-black text-white">{currentSection?.title || 'Untitled Section'}</h3>
          {currentSection?.description && (
            <p className="text-sm text-white/40 mt-1">{currentSection.description}</p>
          )}
        </div>
      )}

      {displayQuestions.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-white/5 border-dashed">
          <div className="w-20 h-20 bg-white/[0.03] rounded-3xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 text-white/10" />
          </div>
          <h2 className="text-xl font-bold text-white/60 mb-2">
            {selectedSectionId ? "No questions in this section." : "Create your first question."}
          </h2>
          <p className="text-white/20 mb-8 max-w-xs mx-auto text-sm">
            {selectedSectionId
              ? "Add a question to this section to start collecting data."
              : "Click the button below to add your first logic node and start building your survey."
            }
          </p>
          <button
            onClick={() => onCreateQuestion(selectedSectionId || undefined)}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl mx-auto transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Question
          </button>
        </div>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={displayQuestions.map(q => q.id)}
              strategy={verticalListSortingStrategy}
            >
              {displayQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onUpdate={onUpdateQuestion}
                  onDelete={onDeleteQuestion}
                  onAddOption={onAddOption}
                  onUpdateOption={onUpdateOption}
                  onDeleteOption={onDeleteOption}
                  onSelect={() => onSelectQuestion(question.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

          <button
            onClick={() => onCreateQuestion(selectedSectionId || undefined)}
            className="w-full py-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 border-dashed rounded-2xl flex items-center justify-center gap-2 text-white/40 hover:text-white transition-all group"
          >
            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-nova-purple group-hover:text-white transition-colors">
                <Plus className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm uppercase tracking-widest">Add Question</span>
          </button>
        </>
      )}
    </div>
  );
}
