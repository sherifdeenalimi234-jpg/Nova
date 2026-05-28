"use client";

import React from "react";
import { motion } from "framer-motion";

const signals = [
  { id: 1, label: "Research", color: "border-nova-cyan", icon: "R" },
  { id: 2, label: "Surveys", color: "border-nova-purple", icon: "S" },
  { id: 3, label: "Projects", color: "border-nova-green", icon: "P" },
  { id: 4, label: "Signals", color: "border-nova-orange", icon: "!" },
  { id: 5, label: "Community", color: "border-white", icon: "C" },
  { id: 6, label: "Discovery", color: "border-nova-cyan", icon: "D" },
];

const RingSystem = () => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-6 px-6">
      <div className="flex gap-6 min-w-max">
        {signals.map((signal) => (
          <div key={signal.id} className="flex flex-col items-center gap-2">
            <button className={`relative w-20 h-20 rounded-full border-2 ${signal.color} p-1 active:scale-90 transition-transform`}>
              <div className="w-full h-full rounded-full bg-[#111] border border-white/10 flex items-center justify-center overflow-hidden">
                <span className="text-xl font-bold italic opacity-40">{signal.icon}</span>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className={`absolute -inset-1 border-t-2 ${signal.color} rounded-full opacity-40`}
              />
            </button>
            <span className="text-[9px] uppercase tracking-widest text-white/60">{signal.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RingSystem;
