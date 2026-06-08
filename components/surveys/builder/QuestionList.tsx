"use client";

import { useState, useCallback, useEffect } from 'react';
import { SurveyQuestion, QuestionType, SurveyOption } from '@/lib/types/surveys';
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
import { Plus, MessageSquare } from 'lucide-react';
import QuestionCard from './QuestionCard';
import { saveQuestion, deleteQuestion, saveOption, deleteOption, reorderQuestions } from '@/lib/actions/surveys';

interface QuestionListProps {
  surveyId: string;
  initialQuestions: SurveyQuestion[];
  onUpdateQuestion: (id: string, updates: any) => void;
  onDeleteQuestion: (id: string) => void;
  onAddQuestion: (sectionId: string | null) => void;
}

export default function QuestionList({
  surveyId,
  initialQuestions,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddQuestion
}: QuestionListProps) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>(initialQuestions);

  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = questions.findIndex((i) => i.id === active.id);
      const newIndex = questions.findIndex((i) => i.id === over?.id);
      const newItems = arrayMove(questions, oldIndex, newIndex);

      setQuestions(newItems);

      // Persist to DB
      await reorderQuestions(surveyId, newItems.map(q => q.id));
    }
  };

  const addQuestion = async () => {
    onAddQuestion(null);
  };

  const updateQuestion = async (id: string, updates: Partial<SurveyQuestion>) => {
    onUpdateQuestion(id, updates);
  };

  const removeQuestion = async (id: string) => {
    onDeleteQuestion(id);
  };

  const duplicateQuestion = async (id: string) => {
    const questionToDup = questions.find(q => q.id === id);
    if (!questionToDup) return;

    const { id: _, created_at, updated_at, options, ...qData } = questionToDup as any;
    const result = await saveQuestion(surveyId, { ...qData, title: `${qData.title} (Copy)`, order_index: questions.length });

    if (result.data) {
      const newQ = result.data as SurveyQuestion;
      // Duplicate options if any
      if (options) {
        const newOptions = [];
        for (const opt of options) {
          const { id: __, ...oData } = opt;
          const oResult = await saveOption(newQ.id, oData);
          if (oResult.data) newOptions.push(oResult.data);
        }
        newQ.options = newOptions;
      }
      setQuestions([...questions, newQ]);
    }
  };

  const addOption = async (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const newOption = {
      text: '',
      order_index: (question.options || []).length
    };

    const result = await saveOption(questionId, newOption);
    if (result.data) {
      setQuestions(prev => prev.map(q =>
        q.id === questionId
          ? { ...q, options: [...(q.options || []), result.data as SurveyOption] }
          : q
      ));
    }
  };

  const updateOption = async (questionId: string, optionId: string, text: string) => {
    setQuestions(prev => prev.map(q =>
      q.id === questionId
        ? { ...q, options: (q.options || []).map(o => o.id === optionId ? { ...o, text } : o) }
        : q
    ));
    await saveOption(questionId, { id: optionId, text });
  };

  const removeOption = async (questionId: string, optionId: string) => {
    setQuestions(prev => prev.map(q =>
      q.id === questionId
        ? { ...q, options: (q.options || []).filter(o => o.id !== optionId) }
        : q
    ));
    await deleteOption(questionId, optionId);
  };

  return (
    <div className="space-y-6 pb-32">
      {questions.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-zinc-800 border-dashed">
          <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 text-zinc-700" />
          </div>
          <h2 className="text-xl font-bold text-zinc-300 mb-2">Create your first question.</h2>
          <p className="text-zinc-500 mb-8 max-w-xs mx-auto">
            Click the button below to add your first logic node and start building your survey.
          </p>
          <button
            onClick={addQuestion}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl mx-auto transition-all"
          >
            <Plus className="w-5 h-5" />
            Add First Question
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
              items={questions.map(q => q.id)}
              strategy={verticalListSortingStrategy}
            >
              {questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onUpdate={updateQuestion}
                  onDelete={removeQuestion}
                  onDuplicate={duplicateQuestion}
                  onAddOption={addOption}
                  onUpdateOption={updateOption}
                  onDeleteOption={removeOption}
                />
              ))}
            </SortableContext>
          </DndContext>

          <button
            onClick={addQuestion}
            className="w-full py-4 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl flex items-center justify-center gap-2 text-zinc-400 hover:text-white transition-all group"
          >
            <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                <Plus className="w-5 h-5" />
            </div>
            <span className="font-bold">Add Question</span>
          </button>
        </>
      )}
    </div>
  );
}
