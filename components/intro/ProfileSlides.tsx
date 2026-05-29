"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileSlidesProps {
  onComplete: () => void;
}

import { createClient } from "@/lib/supabase/client";

const ProfileSlides: React.FC<ProfileSlidesProps> = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfiles() {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_verified_creator', true)
        .limit(5);

      if (data && data.length > 0) {
        setProfiles(data);
      } else {
        // Fallback if no creators exist yet
        setProfiles([
          {
            full_name: "System Initializing",
            bio: "Waiting for first innovation signals...",
            avatar_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000"
          }
        ]);
      }
      setLoading(false);
    }
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (loading || profiles.length === 0) return;

    const timer = setTimeout(() => {
      if (index < profiles.length - 1) {
        setIndex(index + 1);
      } else {
        onComplete();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [index, onComplete, profiles, loading]);

  if (loading) return <div className="h-screen w-screen bg-black" />;

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {/* Background Image with Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-[3000ms] ease-linear"
            style={{
              backgroundImage: `url(${profiles[index]?.avatar_url || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000"})`,
              transform: 'scale(1.1)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          {/* Profile Info */}
          <div className="relative z-10 text-center px-6 max-w-2xl">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h2 className="text-nova-cyan text-xs tracking-[0.3em] uppercase mb-2">Featured Member</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-1">{profiles[index]?.full_name}</h3>
              <p className="text-lg text-white/60 font-light mb-8 italic tracking-wide">
                "{profiles[index]?.bio || "Pioneering the future of the NOVA community."}"
              </p>

              <div className="inline-block px-4 py-1 border border-white/20 rounded-full text-[10px] uppercase tracking-widest text-white/40">
                Verified Creator
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Dots */}
      <div className="absolute bottom-10 flex gap-3">
        {profiles.map((_, i) => (
          <div
            key={i}
            className={`h-1 transition-all duration-500 ${i === index ? 'w-8 bg-nova-cyan shadow-[0_0_8px_#00f2ff]' : 'w-2 bg-white/20'}`}
          />
        ))}
      </div>

      {/* Navigation Skip */}
      <button
        onClick={onComplete}
        className="absolute bottom-10 right-10 text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
      >
        Skip to Hub
      </button>
    </div>
  );
};

export default ProfileSlides;
