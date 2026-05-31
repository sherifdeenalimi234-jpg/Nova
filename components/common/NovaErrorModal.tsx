"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, RotateCcw } from 'lucide-react';

interface NovaErrorModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  onRetry?: () => void;
}

const NovaErrorModal: React.FC<NovaErrorModalProps> = ({
  isOpen,
  title = "System Error",
  message,
  onClose,
  onRetry
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-[#0a0a0b] border border-red-500/20 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)]"
          >
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
                <AlertCircle size={32} />
              </div>

              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-red-500 mb-2">{title}</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed mb-8">
                {message}
              </p>

              <div className="flex gap-3 w-full">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    <RotateCcw size={14} /> Retry
                  </button>
                )}
                <button
                  onClick={onClose}
                  className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all ${
                    onRetry
                    ? 'flex-1 bg-white text-black hover:bg-nova-cyan'
                    : 'w-full bg-white text-black hover:bg-nova-cyan'
                  }`}
                >
                  Dismiss
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NovaErrorModal;
