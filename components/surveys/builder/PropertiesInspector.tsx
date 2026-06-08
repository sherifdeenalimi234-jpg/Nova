"use client";

import React from 'react';
import { Survey, SurveyQuestion, SurveySection } from '@/lib/types/surveys';
import {
  Settings2,
  Info,
  AlertCircle,
  Trash2,
  Copy,
  Eye,
  Lock,
  Zap,
  Layout,
  Type,
  CheckCircle2,
  List,
  Star,
  Calendar,
  ToggleLeft,
  ChevronDown,
  Hash,
  Plus,
  Layers
} from 'lucide-react';

import { saveQuestion, saveSection, deleteQuestion, deleteSection, saveOption, deleteOption } from '@/lib/actions/surveys';

interface PropertiesInspectorProps {
  survey: Survey;
  selectedQuestionId: string | null;
  selectedSectionId: string | null;
  onUpdate: (type: 'question' | 'section', id: string, updates: any) => void;
  onDelete: (type: 'question' | 'section', id: string) => void;
}

export default function PropertiesInspector({
  survey,
  selectedQuestionId,
  selectedSectionId,
  onUpdate,
  onDelete
}: PropertiesInspectorProps) {

  const selectedQuestion = survey.questions?.find(q => q.id === selectedQuestionId);
  const selectedSection = survey.sections?.find(s => s.id === selectedSectionId);

  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (selectedQuestion) {
      onUpdate('question', selectedQuestion.id, { title: value });
    } else if (selectedSection) {
      onUpdate('section', selectedSection.id, { title: value });
    }
  };

  const handleDescriptionChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (selectedQuestion) {
      onUpdate('question', selectedQuestion.id, { description: value });
    } else if (selectedSection) {
      onUpdate('section', selectedSection.id, { description: value });
    }
  };

  const handleToggleRequired = async () => {
    if (selectedQuestion) {
      onUpdate('question', selectedQuestion.id, { is_required: !selectedQuestion.is_required });
    }
  };

  const handleTypeChange = async (type: string) => {
    if (selectedQuestion) {
      onUpdate('question', selectedQuestion.id, { type });
    }
  };

  const handleAddOption = async () => {
    if (selectedQuestion) {
      const newOption = {
        question_id: selectedQuestion.id,
        text: `Option ${(selectedQuestion.options || []).length + 1}`,
        order_index: (selectedQuestion.options || []).length
      };
      const result = await saveOption(selectedQuestion.id, newOption);
      if (result.data) {
        onUpdate('question', selectedQuestion.id, {
          options: [...(selectedQuestion.options || []), result.data]
        });
      }
    }
  };

  const handleUpdateOption = async (optionId: string, text: string) => {
    if (selectedQuestion) {
      await saveOption(selectedQuestion.id, { id: optionId, text });
      onUpdate('question', selectedQuestion.id, {
        options: selectedQuestion.options?.map(o => o.id === optionId ? { ...o, text } : o)
      });
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (selectedQuestion) {
      await deleteOption(selectedQuestion.id, optionId);
      onUpdate('question', selectedQuestion.id, {
        options: selectedQuestion.options?.filter(o => o.id !== optionId)
      });
    }
  };

  const handleDelete = async () => {
    if (selectedQuestion) {
      onDelete('question', selectedQuestion.id);
    } else if (selectedSection) {
      onDelete('section', selectedSection.id);
    }
  };

  if (!selectedQuestion && !selectedSection) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-6">
        <div className="w-20 h-20 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/10">
          <Settings2 size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Inspector Idle</h3>
          <p className="text-[10px] text-white/20 uppercase font-bold leading-relaxed max-w-[200px]">
            Select a question or section on the map to modify its properties.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Inspector Header */}
      <div className="p-8 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-nova-purple/10 flex items-center justify-center text-nova-purple">
            {selectedQuestion ? <Type size={20} /> : <Layout size={20} />}
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest">
              {selectedQuestion ? 'Question Properties' : 'Section Properties'}
            </h3>
            <p className="text-[9px] text-white/20 font-black uppercase tracking-tighter">
              Node ID: {selectedQuestion?.id.slice(0, 8) || selectedSection?.id.slice(0, 8)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest transition-all">
            <Copy size={12} />
            <span>Duplicate</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest transition-all"
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

        {/* Title & Description */}
        <div className="space-y-4">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 px-1">Identification</label>
          <div className="space-y-3">
             <div className="space-y-1.5">
                <span className="text-[8px] font-black uppercase text-white/20 pl-4">Title</span>
                <input
                  type="text"
                  value={selectedQuestion?.title || selectedSection?.title || ''}
                  onChange={handleTitleChange}
                  placeholder="Enter title..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-xs font-medium focus:outline-none focus:border-nova-purple/50 transition-all placeholder:text-white/10"
                />
             </div>
             <div className="space-y-1.5">
                <span className="text-[8px] font-black uppercase text-white/20 pl-4">Description</span>
                <textarea
                  rows={3}
                  value={selectedQuestion?.description || selectedSection?.description || ''}
                  onChange={handleDescriptionChange}
                  placeholder="Additional context (optional)..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-xs font-medium focus:outline-none focus:border-nova-purple/50 transition-all resize-none placeholder:text-white/10"
                />
             </div>
          </div>
        </div>

        {selectedQuestion && (
          <>
            {/* Logic & Validation */}
            <div className="space-y-4">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 px-1">Logic & Validation</label>
              <div className="space-y-3">
                 <div
                    onClick={handleToggleRequired}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10 cursor-pointer hover:bg-white/[0.05] transition-all"
                 >
                    <div className="flex items-center gap-3">
                       <Lock size={14} className={selectedQuestion?.is_required ? "text-nova-purple" : "text-white/20"} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Required Field</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${selectedQuestion?.is_required ? 'bg-nova-purple' : 'bg-white/10'}`}>
                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${selectedQuestion?.is_required ? 'right-1' : 'left-1'}`} />
                    </div>
                 </div>

                 <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all group">
                    <div className="flex items-center gap-3">
                       <Zap size={14} className="text-white/20 group-hover:text-nova-cyan transition-colors" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Add Logic Jump</span>
                    </div>
                    <Info size={14} className="text-white/10" />
                 </button>
              </div>
            </div>

            {/* Question Type Selection */}
            <div className="space-y-4">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 px-1">Question Type</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'short_text', label: 'Short Text', icon: Type },
                  { id: 'long_text', label: 'Long Text', icon: List },
                  { id: 'single_choice', label: 'Single Choice', icon: CheckCircle2 },
                  { id: 'multiple_choice', label: 'Multiple Choice', icon: Layers },
                  { id: 'dropdown', label: 'Dropdown', icon: ChevronDown },
                  { id: 'rating', label: 'Rating', icon: Star },
                  { id: 'yes_no', label: 'Yes / No', icon: ToggleLeft },
                  { id: 'date', label: 'Date', icon: Calendar },
                  { id: 'number', label: 'Number', icon: Hash }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleTypeChange(type.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      selectedQuestion.type === type.id
                      ? 'bg-nova-purple/20 border-nova-purple text-white'
                      : 'bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/[0.05]'
                    }`}
                  >
                    <type.icon size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Options Management (for Choice types) */}
            {['single_choice', 'multiple_choice', 'dropdown'].includes(selectedQuestion.type) && (
              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 px-1">Options</label>
                <div className="space-y-2">
                  {selectedQuestion.options?.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleUpdateOption(opt.id, e.target.value)}
                        className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-[11px] focus:outline-none focus:border-nova-purple/50"
                      />
                      <button
                        onClick={() => handleDeleteOption(opt.id)}
                        className="p-2 text-white/20 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddOption}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-white/10 text-white/20 hover:text-white/40 transition-all"
                  >
                    <Plus size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Add Option</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* Inspector Footer */}
      <div className="p-8 border-t border-white/5 bg-black/40">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-nova-cyan/10 border border-nova-cyan/20">
          <AlertCircle size={16} className="text-nova-cyan flex-shrink-0" />
          <p className="text-[9px] font-bold text-nova-cyan leading-tight uppercase tracking-tight">
            All changes are synchronized in real-time with the central intelligence node.
          </p>
        </div>
      </div>
    </div>
  );
}
