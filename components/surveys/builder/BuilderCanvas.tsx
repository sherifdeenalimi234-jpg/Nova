"use client";

import React from 'react';
import { Survey, SurveyQuestion } from '@/lib/types/surveys';
import QuestionList from './QuestionList';
import { MessageSquare, Sparkles, Rocket } from 'lucide-react';

interface BuilderCanvasProps {
  survey: Survey;
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
}

export default function BuilderCanvas({ survey, selectedQuestionId, onSelectQuestion }: BuilderCanvasProps) {
  return (
    <div className="min-h-full flex flex-col">
      {/* Canvas Header */}
      <div className="p-8 lg:p-12 border-b border-white/5 bg-white/[0.01]">
         <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="space-y-1">
               <div className="flex items-center gap-2 text-nova-purple">
                  <Sparkles size={14} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Editor Mode</span>
               </div>
               <h2 className="text-2xl font-black uppercase tracking-tight">{survey.title}</h2>
               <p className="text-sm text-white/40 font-medium max-w-xl">
                 {survey.description || "Start building your research node by adding questions below. Use the drag-and-drop handles to reorder."}
               </p>
            </div>

            <div className="hidden lg:flex flex-col items-end gap-2">
               <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                       {String.fromCharCode(64 + i)}
                    </div>
                  ))}
               </div>
               <span className="text-[8px] font-black uppercase tracking-widest text-white/20">3 Collaborators</span>
            </div>
         </div>
      </div>

      {/* Main Question List Area */}
      <div className="flex-1 p-8 lg:p-12 bg-black/20">
        <div className="max-w-4xl mx-auto">
          <QuestionList
            surveyId={survey.id}
            initialQuestions={survey.questions || []}
          />
        </div>
      </div>

      {/* Canvas Footer (Guidance) */}
      <div className="p-12 border-t border-white/5">
         <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 opacity-40">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                  <MessageSquare size={18} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Need help?</p>
                  <p className="text-[9px]">Check our documentation for advanced logic setups.</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Rocket size={18} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Ready to launch?</p>
                  <p className="text-[9px]">Head to the Collect tab once your questions are ready.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
