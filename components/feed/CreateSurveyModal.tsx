"use client";

import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Loader2, ListTodo } from 'lucide-react';
import { createSurvey } from '@/lib/actions/surveys';

export default function CreateSurveyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([{ id: 1, text: '', type: 'choice', options: ['', ''] }]);

  if (!isOpen) return null;

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), text: '', type: 'choice', options: ['', ''] }]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: number, text: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
  };

  const updateOption = (qId: number, oIdx: number, val: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newOptions = [...q.options];
        newOptions[oIdx] = val;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await createSurvey({ title, description, questions });
    if (!error) {
      alert("Survey intelligence deployed.");
      onClose();
    } else {
      const errorMessage = typeof error === 'string' ? error : error.message;
      alert("Deployment failed: " + errorMessage);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
      <div className="w-full max-w-2xl bg-[#0a0a0b] border border-white/10 rounded-[32px] overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-nova-purple">Deploy Research Survey</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Survey Title</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nova-purple/50 transition-all" placeholder="Global AI Ethics Inquiry" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Inquiry Objective</label>
              <textarea required rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nova-purple/50 transition-all resize-none" placeholder="Explain the research goals..." />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60">Question Nodes</h3>
               <button type="button" onClick={addQuestion} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-nova-purple hover:text-nova-cyan transition-colors">
                  <Plus size={14} /> Add Logic Node
               </button>
            </div>

            {questions.map((q, idx) => (
              <div key={q.id} className="p-6 rounded-2xl bg-white/2 border border-white/5 space-y-4">
                 <div className="flex items-start gap-4">
                    <span className="text-xs font-black text-nova-purple/40 pt-3">0{idx + 1}</span>
                    <input required value={q.text} onChange={(e) => updateQuestion(q.id, e.target.value)} className="flex-1 bg-transparent border-b border-white/10 py-2 text-sm focus:outline-none focus:border-nova-purple/50 transition-all" placeholder="Enter inquiry question..." />
                    <button type="button" onClick={() => removeQuestion(q.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors">
                       <Trash2 size={16} />
                    </button>
                 </div>
                 <div className="grid grid-cols-2 gap-3 pl-8">
                    {q.options.map((opt, oIdx) => (
                       <input key={oIdx} required value={opt} onChange={(e) => updateOption(q.id, oIdx, e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-nova-purple/30" placeholder={`Option ${oIdx + 1}`} />
                    ))}
                 </div>
              </div>
            ))}
          </div>
        </form>

        <div className="p-8 border-t border-white/5 bg-white/[0.01]">
          <button type="submit" disabled={loading} onClick={handleSubmit} className="w-full py-4 rounded-2xl bg-nova-purple text-white text-[10px] font-black uppercase tracking-[0.4em] hover:shadow-[0_0_30px_rgba(188,19,254,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Deploy To Ecosystem
          </button>
        </div>
      </div>
    </div>
  );
}
