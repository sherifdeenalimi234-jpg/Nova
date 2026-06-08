"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Layers, MoreHorizontal, Plus, GripVertical } from 'lucide-react';
import { SurveySection } from '@/lib/types/surveys';

interface SortableSectionProps {
  section: SurveySection;
  isActive: boolean;
  onSelect: () => void;
  onAddQuestion: () => void;
  children: React.ReactNode;
}

export function SortableSection({
  section,
  isActive,
  onSelect,
  onAddQuestion,
  children
}: SortableSectionProps) {
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
    zIndex: isDragging ? 40 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className={`space-y-6 ${isDragging ? 'opacity-30' : ''}`}>
       <div className={`p-6 rounded-[2.5rem] border transition-all flex items-center justify-between ${
         isActive ? 'bg-white/5 border-nova-cyan/30' : 'bg-white/[0.02] border-white/5'
       }`}>
          <div className="flex items-center gap-6">
             <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-white/10 hover:text-white transition-colors">
                <GripVertical size={20} />
             </div>
             <div onClick={onSelect} className="cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                   <Layers size={14} className="text-nova-cyan" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-nova-cyan">Research Section</span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">{section.title}</h3>
             </div>
          </div>

          <div className="flex items-center gap-2">
             <button
               onClick={onAddQuestion}
               className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest transition-all"
             >
                <Plus size={14} />
                <span>Add Question</span>
             </button>
             <button className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40">
                <MoreHorizontal size={18} />
             </button>
          </div>
       </div>

       <div className="pl-6 lg:pl-12 space-y-6 border-l border-white/5 ml-10">
          {children}
       </div>
    </div>
  );
}
