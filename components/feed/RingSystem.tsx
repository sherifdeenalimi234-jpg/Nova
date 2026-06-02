"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Info, ChevronRight } from "lucide-react";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const RingSystem = () => {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState<any | null>(null);

  useEffect(() => {
    async function fetchSignals() {
      const supabase = createClient();
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        const mappedSignals = data.map((post: any) => ({
          id: post.id,
          label: post.post_type.toUpperCase().replace('_', ' '),
          color: post.post_type === 'survey' ? 'purple' : post.post_type === 'project' ? 'green' : 'cyan',
          icon: post.title.substring(0, 2).toUpperCase(),
          content: post.content,
          title: post.title
        }));
        setSignals(mappedSignals);
      }
      setLoading(false);
    }
    fetchSignals();
  }, []);

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

  if (loading) {
    return (
      <div className="w-full py-10 flex gap-6 px-6 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-20 h-20 rounded-full border-2 border-white/5 animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  if (signals.length === 0) return null;

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
                  <span className={`text-nova-${selectedSignal.color} mr-4`}>//</span>
                  {selectedSignal.title.toUpperCase()}
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
                    <button
                      onClick={() => {
                        if (selectedSignal.label === 'PROJECT') {
                          const projectIdMatch = selectedSignal.content?.match(/\[Project ID: (.*?)\]/);
                          const projectId = projectIdMatch ? projectIdMatch[1] : null;
                          if (projectId) {
                            router.push(`/projects/${projectId}`);
                          } else {
                            const fetchAndNavigate = async () => {
                              const supabase = createClient();
                              const { data } = await supabase.from('projects').select('id').eq('title', selectedSignal.title).limit(1).single();
                              if (data) router.push(`/projects/${data.id}`);
                            };
                            fetchAndNavigate();
                          }
                        }
                      }}
                      className="flex items-center gap-2 text-nova-cyan group"
                    >
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
