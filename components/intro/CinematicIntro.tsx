"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CinematicIntroProps {
  onComplete: () => void;
}

const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 1000);
          return 100;
        }
        return prev + 1;
      });
    }, 50); // 5 seconds for 100%

    return () => clearInterval(interval);
  }, [onComplete]);

  const [particles, setParticles] = useState<{ x: string; y: string; duration: number }[]>([]);

  useEffect(() => {
    setParticles(
      [...Array(20)].map(() => ({
        x: Math.random() * 100 + "%",
        y: Math.random() * 100 + "%",
        duration: Math.random() * 5 + 5,
      }))
    );
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black flex flex-col items-center justify-center">
      {/* Background Environment */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,242,255,0.1),transparent_70%)]" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center mix-blend-overlay animate-slow-zoom" />
        </div>

        {/* Fog Layers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"
        />

        {/* Floating Particles (Simple CSS implementation) */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              initial={{
                x: particle.x,
                y: particle.y,
                opacity: 0
              }}
              animate={{
                y: [null, "-100px"],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute w-1 h-1 bg-nova-cyan rounded-full blur-[1px]"
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="mb-2"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-[0.2em] text-white text-glow">
            NOVA COMMUNITY
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.5, duration: 1.5 }}
          className="text-sm md:text-lg tracking-[0.4em] text-gray-300 uppercase mt-4"
        >
          Building Future Innovation Together
        </motion.p>

        {/* Loading Indicator */}
        <div className="mt-16 w-64 md:w-80">
          <div className="flex justify-between items-end mb-2 text-[10px] tracking-widest text-nova-cyan/70 uppercase">
            <span>System Initializing</span>
            <span>{progress}%</span>
          </div>
          <div className="h-[2px] w-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-nova-cyan shadow-[0_0_10px_#00f2ff]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mt-2 h-1 w-1 bg-nova-cyan rounded-full mx-auto"
          />
        </div>
      </div>

      {/* Skip Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={onComplete}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 md:left-auto md:right-10 md:translate-x-0 glass px-6 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] text-white/70 hover:text-white hover:border-white/30 transition-all active:scale-95"
      >
        Skip Intro
      </motion.button>

      <style jsx global>{`
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default CinematicIntro;
