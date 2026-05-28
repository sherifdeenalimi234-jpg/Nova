"use client";

import React, { useState } from 'react';
import { X, CheckCircle2, Loader2, Play } from 'lucide-react';
import { submitSurveyResponse } from '@/lib/actions/surveys';

interface TakeSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: any;
}

export default function TakeSurveyModal({ isOpen, onClose, survey }: TakeSurveyModalProps) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  if (!isOpen || !survey) return null;

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [currentStep]: option });
    if (currentStep < survey.questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await submitSurveyResponse(survey.id, answers);
    if (!error) {
      setIsComplete(true);
    } else {
      const errorMessage = typeof error === 'string' ? error : error.message;
      alert("Submission failed: " + errorMessage);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl">
      <div className="w-full max-w-lg bg-[#0a0a0b] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(188,19,254,0.1)]">
        <div className="px-10 py-8 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-nova-purple animate-pulse" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Active Inquiry</h2>
           </div>
           <button onClick={onClose} className="text-white/20 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <div className="px-10 pb-12">
          {!isComplete ? (
            <div className="space-y-8">
               <div className="space-y-2">
                  <div className="flex justify-between items-end mb-4">
                     <span className="text-[8px] font-black text-nova-purple uppercase tracking-widest">Question 0{currentStep + 1} / 0{survey.questions.length}</span>
                     <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-nova-purple transition-all duration-500" style={{ width: `${((currentStep + 1) / survey.questions.length) * 100}%` }} />
                     </div>
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight">{survey.questions[currentStep].text}</h3>
               </div>

               <div className="grid gap-3">
                  {survey.questions[currentStep].options.map((option: string) => (
                    <button
                      key={option}
                      onClick={() => handleSelect(option)}
                      className={`w-full p-5 rounded-2xl border text-left text-sm transition-all flex items-center justify-between group ${
                        answers[currentStep] === option
                        ? 'bg-nova-purple border-nova-purple text-white shadow-[0_0_20px_rgba(188,19,254,0.3)]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-nova-purple/50'
                      }`}
                    >
                       {option}
                       <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                         answers[currentStep] === option ? 'border-white bg-white' : 'border-white/20 group-hover:border-nova-purple/40'
                       }`}>
                          {answers[currentStep] === option && <div className="w-2 h-2 rounded-full bg-nova-purple" />}
                       </div>
                    </button>
                  ))}
               </div>

               {currentStep === survey.questions.length - 1 && answers[currentStep] && (
                 <button
                   onClick={handleSubmit}
                   disabled={loading}
                   className="w-full py-5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-nova-cyan transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                 >
                   {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
                   Finalize Intel
                 </button>
               )}
            </div>
          ) : (
            <div className="text-center py-10">
               <div className="w-20 h-20 rounded-full bg-nova-green/10 border border-nova-green/20 flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 size={40} className="text-nova-green" />
               </div>
               <h3 className="text-2xl font-black uppercase tracking-widest text-white mb-4">Signal Synthesized</h3>
               <p className="text-white/40 text-xs leading-relaxed max-w-[240px] mx-auto mb-10">Your research contribution has been successfully merged with the ecosystem database.</p>
               <button onClick={onClose} className="px-10 py-4 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all">Close Instance</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
