"use client";
export const dynamic = "force-dynamic";



import React, { useState } from 'react';
import { createSurvey } from '@/lib/actions/surveys';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  ChevronDown,
  Type,
  CheckSquare,
  Circle,
  Star,
  Upload,
  Settings,
  Eye,
  Save,
  Rocket
} from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

type QuestionType = 'text' | 'multiple-choice' | 'rating' | 'file';

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  required: boolean;
}

export default function CreateSurveyPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', type: 'text', text: 'Enter your first question...', required: true }
  ]);

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      text: '',
      required: true,
      options: type === 'multiple-choice' ? ['Option 1'] : undefined
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Survey Architect</h1>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Design ecosystem feedback instruments</p>
         </div>
         <div className="flex gap-4">
            <button className="px-6 py-3 rounded-2xl border border-white/10 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
               <Save size={14} />
               Save Draft
            </button>
            <button
              onClick={async () => {
                if (!title || !description || questions.length === 0) return;
                setLoading(true);
                const { error } = await createSurvey({
                  title,
                  description,
                  questions
                });
                setLoading(false);
                if (!error) router.push('/creator/surveys');
              }}
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-nova-cyan text-black text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
            >
               <Rocket size={14} />
               {loading ? 'Launching...' : 'Launch Survey'}
            </button>
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-8">
           {/* Survey Info */}
           <section className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-6">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Survey Title"
                className="w-full bg-transparent border-none text-2xl font-black uppercase tracking-tight focus:ring-0 placeholder:text-white/10"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this data collection..."
                rows={2}
                className="w-full bg-transparent border-none text-sm focus:ring-0 placeholder:text-white/10 resize-none"
              />
           </section>

           {/* Questions Builder */}
           <div className="space-y-6">
              {questions.map((question, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={question.id}
                  className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl group relative"
                >
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                         <span className="text-[10px] font-black text-white/20">#{index + 1}</span>
                         <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-nova-cyan">
                            {question.type}
                         </div>
                      </div>
                      <button onClick={() => removeQuestion(question.id)} className="text-white/20 hover:text-red-500 transition-colors">
                         <Trash2 size={16} />
                      </button>
                   </div>

                   <input
                     type="text"
                     value={question.text}
                     onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                     placeholder="Enter question text..."
                     className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-nova-cyan/30 mb-6"
                   />

                   {question.type === 'multiple-choice' && (
                     <div className="space-y-3 mb-6">
                        {question.options?.map((option, i) => (
                          <div key={i} className="flex items-center gap-4">
                             <Circle size={14} className="text-white/20" />
                             <input
                               type="text"
                               value={option}
                               className="bg-transparent border-b border-white/5 focus:border-nova-cyan/30 text-xs py-1 focus:outline-none flex-1"
                             />
                          </div>
                        ))}
                        <button className="text-[8px] font-black uppercase tracking-widest text-nova-cyan/60 hover:text-nova-cyan flex items-center gap-2 mt-4">
                           <Plus size={12} />
                           Add Option
                        </button>
                     </div>
                   )}

                   <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-4 rounded-full bg-nova-cyan/20 p-0.5 flex justify-end">
                            <div className="w-3 h-3 rounded-full bg-nova-cyan" />
                         </div>
                         <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Required</span>
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>

           {/* Add Question Controls */}
           <section className="p-8 rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center gap-8">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Integrate Component</p>
              <div className="flex flex-wrap justify-center gap-4">
                 {[
                   { type: 'text', icon: Type, label: 'Text' },
                   { type: 'multiple-choice', icon: CheckSquare, label: 'Options' },
                   { type: 'rating', icon: Star, label: 'Rating' },
                   { type: 'file', icon: Upload, label: 'File' },
                 ].map((tool) => (
                   <button
                     key={tool.type}
                     onClick={() => addQuestion(tool.type as QuestionType)}
                     className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-all group"
                   >
                      <tool.icon size={16} className="text-white/40 group-hover:text-nova-cyan" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/60">{tool.label}</span>
                   </button>
                 ))}
              </div>
           </section>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
           <section className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-8">
                 <Settings size={16} className="text-nova-purple" />
                 <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40">Architectural Rules</h2>
              </div>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-1">Deadline</label>
                    <input type="date" className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[10px] text-white/60" />
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Anonymous Mode</span>
                    <div className="w-8 h-4 rounded-full bg-white/5 p-0.5">
                       <div className="w-3 h-3 rounded-full bg-white/20" />
                    </div>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Export Results</span>
                    <div className="w-8 h-4 rounded-full bg-nova-cyan/20 p-0.5 flex justify-end">
                       <div className="w-3 h-3 rounded-full bg-nova-cyan" />
                    </div>
                 </div>
              </div>
           </section>

           <div className="p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-nova-cyan/5 to-transparent">
              <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-widest">
                 Surveys are essential for gathering ecosystem intelligence. All responses are securely logged.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
