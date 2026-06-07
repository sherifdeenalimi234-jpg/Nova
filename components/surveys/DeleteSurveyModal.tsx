"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface DeleteSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  surveyTitle: string;
  isDeleting: boolean;
}

export default function DeleteSurveyModal({
  isOpen,
  onClose,
  onConfirm,
  surveyTitle,
  isDeleting
}: DeleteSurveyModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-black border border-white/10 rounded-[3rem] p-8 shadow-2xl pointer-events-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                  <AlertTriangle size={24} />
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white/20 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Delete Survey?</h3>
              <p className="text-white/40 text-xs leading-relaxed mb-8">
                You are about to delete <span className="text-white font-bold">"{surveyTitle}"</span>. This action is permanent and will remove all collected responses and data associated with this survey. This cannot be undone.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="w-full py-4 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Permanently Delete
                </button>
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="w-full py-4 rounded-2xl border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
