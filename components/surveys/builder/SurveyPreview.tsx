"use client";

import { useState } from 'react';
import { Survey, SurveyQuestion } from '@/lib/types/surveys';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Send,
  Smartphone,
  Info,
  CheckCircle2,
  Star
} from 'lucide-react';

interface SurveyPreviewProps {
  survey: Survey;
}

export default function SurveyPreview({ survey }: SurveyPreviewProps) {
  const [currentStep, setCurrentStep] = useState<number>(-1); // -1 is intro
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const questions = survey.questions || [];

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(999); // 999 is thank you
    }
  };

  const handleBack = () => {
    if (currentStep > -1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[390px] aspect-[9/19] bg-zinc-950 rounded-[3rem] border-[8px] border-zinc-900 shadow-2xl overflow-hidden relative">
        {/* Status Bar */}
        <div className="h-10 bg-zinc-900 flex items-center justify-between px-8">
            <span className="text-[10px] font-bold text-zinc-500">9:41</span>
            <div className="flex gap-1.5">
                <div className="w-4 h-2 bg-zinc-800 rounded-full" />
                <div className="w-2 h-2 bg-zinc-800 rounded-full" />
            </div>
        </div>

        {/* Dynamic Content */}
        <div className="h-full overflow-y-auto px-6 py-8 pb-32">
          {questions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center">
                <Info className="w-8 h-8 text-zinc-700" />
              </div>
              <h3 className="text-lg font-bold text-zinc-400">No questions available yet.</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Add questions in the Questions tab to see them in this preview.
              </p>
            </div>
          ) : (
          <AnimatePresence mode="wait">
            {currentStep === -1 && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {survey.cover_image && (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden">
                    <img src={survey.cover_image} className="w-full h-full object-cover" alt="Cover" />
                  </div>
                )}
                <h2 className="text-2xl font-bold text-white">{survey.title}</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">{survey.description}</p>
                <div className="flex items-center gap-4 py-4 border-y border-zinc-900">
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Questions</p>
                    <p className="text-lg font-bold text-white">{questions.length}</p>
                  </div>
                  <div className="text-center flex-1 border-x border-zinc-900">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Time</p>
                    <p className="text-lg font-bold text-white">{survey.estimated_time}m</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Privacy</p>
                    <p className="text-lg font-bold text-white text-cyan-400">
                      {survey.settings?.anonymous ? 'Anon' : 'Public'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep >= 0 && currentStep < questions.length && (
              <motion.div
                key={questions[currentStep].id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                    Question {currentStep + 1} of {questions.length}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{questions[currentStep].title}</h3>
                {questions[currentStep].description && (
                  <p className="text-sm text-zinc-500">{questions[currentStep].description}</p>
                )}

                {/* Question Input Simulation */}
                <div className="space-y-3">
                  {['short_text', 'long_text'].includes(questions[currentStep].type) && (
                    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-500 italic text-sm">
                      {questions[currentStep].placeholder || 'Type your answer here...'}
                    </div>
                  )}

                  {['single_choice', 'multiple_choice', 'dropdown'].includes(questions[currentStep].type) && (
                    <div className="space-y-2">
                      {(questions[currentStep].options || []).map((opt: any) => (
                        <div key={opt.id} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-300 flex items-center justify-between">
                          {opt.text}
                          <div className="w-4 h-4 rounded-full border border-zinc-700" />
                        </div>
                      ))}
                    </div>
                  )}

                  {questions[currentStep].type === 'rating' && (
                    <div className="flex justify-between gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-600">
                           <Star className="w-5 h-5" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 999 && (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
                <p className="text-zinc-500 text-sm">Your feedback has been recorded.</p>
              </motion.div>
            )}
          </AnimatePresence>
          )}
        </div>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
          {currentStep === 999 ? (
             <button
               onClick={() => setCurrentStep(-1)}
               className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl"
             >
               Restart Preview
             </button>
          ) : (
            <div className="flex gap-2">
              {currentStep > -1 && (
                <button
                  onClick={handleBack}
                  className="w-14 h-14 flex items-center justify-center bg-zinc-900 text-white rounded-2xl"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              <button
                disabled={questions.length === 0}
                onClick={handleNext}
                className="flex-1 py-4 bg-cyan-500 text-black font-bold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {questions.length === 0 ? 'Empty' : currentStep === questions.length - 1 ? 'Finish' : 'Next'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-zinc-500 text-sm flex items-center gap-2">
        <Smartphone className="w-4 h-4" />
        Mobile Preview Mode
      </p>
    </div>
  );
}
