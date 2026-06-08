"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QuestionCard } from './QuestionCardV2';
import { SurveyQuestion } from '@/lib/types/surveys';

interface SortableQuestionProps {
  question: Partial<SurveyQuestion>;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<SurveyQuestion>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function SortableQuestion({
  question,
  index,
  isActive,
  onSelect,
  onChange,
  onDelete,
  onDuplicate
}: SortableQuestionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: question.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag Handle (Invisible but overlayed for sorting) */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 bottom-0 w-12 z-10 cursor-grab active:cursor-grabbing"
      />

      <QuestionCard
        question={question}
        index={index}
        isActive={isActive}
        onSelect={onSelect}
        onChange={onChange}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      />
    </div>
  );
}
