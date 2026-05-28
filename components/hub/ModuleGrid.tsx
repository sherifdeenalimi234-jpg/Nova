"use client";

import React, { useState } from "react";
import { LayoutGrid, ClipboardList, Users2, LineChart, History, Image as ImageIcon, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const modules = [
  { id: "projects", title: "Projects", icon: LayoutGrid, color: "text-nova-cyan" },
  { id: "surveys", title: "Surveys", icon: ClipboardList, color: "text-nova-purple" },
  { id: "community", title: "Community", icon: Users2, color: "text-nova-green" },
  { id: "analytics", title: "Analytics", icon: LineChart, color: "text-nova-orange" },
  { id: "timeline", title: "Timeline", icon: History, color: "text-white/60" },
  { id: "gallery", title: "Gallery", icon: ImageIcon, color: "text-nova-cyan" },
];

const ModuleGrid = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  const handleCardClick = () => {
    setShowPrompt(true);
  };

  return (
    <section className="px-6 py-4 mb-8">
      <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-4 ml-1">Platform Modules</h3>
      <div className="grid grid-cols-2 gap-3">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={handleCardClick}
            className="glass p-6 rounded-2xl flex flex-col items-center justify-center gap-3 aspect-square group active:scale-95 transition-transform"
          >
            <div className={`p-3 rounded-full bg-white/5 ${module.color} transition-colors group-hover:bg-white/10`}>
              <module.icon size={24} />
            </div>
            <span className="text-xs font-medium tracking-widest uppercase">{module.title}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrompt(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass p-8 rounded-3xl w-full max-w-sm text-center"
            >
              <div className="w-16 h-16 bg-nova-cyan/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="text-nova-cyan" size={28} />
              </div>
              <h4 className="text-xl font-bold mb-2">Restricted Access</h4>
              <p className="text-white/60 text-sm mb-8">Please sign in to access this module and continue your innovation journey.</p>
              <button
                onClick={() => {
                   setShowPrompt(false);
                   // In real app, trigger sign in
                }}
                className="w-full py-4 bg-nova-cyan text-black font-bold uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-colors"
              >
                Sign In With Google
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="mt-4 text-xs text-white/30 uppercase tracking-widest"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ModuleGrid;
