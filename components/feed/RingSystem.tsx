"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Info, ChevronRight } from "lucide-react";

const signals = [
  { id: 1, label: "Research Updates", color: "cyan", hex: "#00f2ff", icon: "RU", content: "Quantum stability achieved at room temperature in the Nova Lab node." },
  { id: 2, label: "Available Surveys", color: "purple", hex: "#a855f7", icon: "AS", content: "New ecosystem participation survey is live. Share your innovation roadmap." },
  { id: 3, label: "Active Projects", color: "green", hex: "#22c55e", icon: "AP", content: "Project Phoenix has reached the 'Incubating' phase with 42 active contributors." },
  { id: 4, label: "Innovation Signals", color: "cyan", hex: "#00f2ff", icon: "IS", content: "Deep space communication protocol Alpha-7 detected new signal patterns." },
  { id: 5, label: "Community Alerts", color: "orange", hex: "#f97316", icon: "CA", content: "Upcoming Global Summit: Virtual participation nodes opening in 24 hours." },
  { id: 6, label: "New Discoveries", color: "cyan", hex: "#00f2ff", icon: "ND", content: "Synthesized bio-conductive materials show 400% efficiency increase." },
  { id: 7, label: "Ecosystem Highlights", color: "white", hex: "#ffffff", icon: "EH", content: "Celebrating 100 successful project launches in the NOVA community this quarter." },
];

const RingSystem = () => {
  const [selectedSignal, setSelectedSignal] = useState<typeof signals[0] | null>(null);

  const getColorClass = (color: string) => {
    switch (color) {
      case "cyan": return "border-nova-cyan";
      case "purple": return "border-nova-purple";
      case "green": return "border-nova-green";
      case "orange": return "border-nova-orange";
      case "white": return "border-white";
      default: return "border-white";
    }
  };

  const getGlowClass = (color: string) => {
    switch (color) {
      case "cyan": return "shadow-[0_0_15px_#00f2ff33]";
      case "purple": return "shadow-[0_0_15px_#a855f733]";
      case "green": return "shadow-[0_0_15px_#22c55e33]";
      case "orange": return "shadow-[0_0_15px_#f9731633]";
      case "white": return "shadow-[0_0_15px_#ffffff33]";
      default: return "";
    }
  };

  return (
    <>
      <div className="w-full overflow-x-auto no-scrollbar py-6 px-6 relative z-10">
        <div className="flex gap-6 min-w-max">
          {signals.map((signal) => (
            <div key={signal.id} className="flex flex-col items-center gap-2">
              <button
                onClick={() => setSelectedSignal(signal)}
                className={`relative w-20 h-20 rounded-full border-2 ${getColorClass(signal.color)} p-1 active:scale-90 transition-transform ${getGlowClass(signal.color)}`}
              >
                <div className="w-full h-full rounded-full bg-[#111] border border-white/10 flex items-center justify-center overflow-hidden">
                  <span className="text-sm font-bold italic opacity-40">{signal.icon}</span>
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className={`absolute -inset-1 border-t-2 ${getColorClass(signal.color)} rounded-full opacity-40`}
                />
              </button>
              <span className="text-[8px] uppercase tracking-widest text-white/60 text-center w-20 leading-tight">{signal.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Research Capsule Fullscreen Panel */}
      <AnimatePresence>
        {selectedSignal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className={`w-8 h-8 rounded-full border-2 ${getColorClass(selectedSignal.color)} flex items-center justify-center text-[10px] font-bold`}>
                    {selectedSignal.icon}
                 </div>
                 <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">{selectedSignal.label}</span>
              </div>
              <button
                onClick={() => setSelectedSignal(null)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 px-8 py-12 flex flex-col justify-center max-w-lg mx-auto w-full">
              <motion.div
                initial={{ y: 40, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <h2 className="text-4xl font-black tracking-tight mb-8 leading-tight">
                  <span className={`text-${selectedSignal.color === 'white' ? 'white' : 'nova-' + selectedSignal.color} mr-4`}>//</span>
                  RESEARCH CAPSULE
                </h2>

                <div className="glass p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02] relative overflow-hidden group">
                  {/* Decorative background for capsule */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                  <p className="text-xl text-white/80 leading-relaxed font-light italic mb-8">
                    "{selectedSignal.content}"
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <div className="flex gap-4">
                      <button className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
                        <Share2 size={16} />
                        <span className="text-[10px] uppercase tracking-widest">Share Signal</span>
                      </button>
                    </div>
                    <button className="flex items-center gap-2 text-nova-cyan group">
                      <span className="text-[10px] font-bold uppercase tracking-widest">Access Node</span>
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="mt-12 flex items-center gap-4 text-white/20">
                   <Info size={14} />
                   <span className="text-[9px] uppercase tracking-[0.2em]">End-to-end encrypted research data stream</span>
                </div>
              </motion.div>
            </div>

            {/* Bottom Footer for Capsule */}
            <div className="p-8 text-center">
              <button
                onClick={() => setSelectedSignal(null)}
                className="text-[10px] uppercase tracking-[0.5em] text-white/30 hover:text-white transition-colors"
              >
                Dismiss Signal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RingSystem;
