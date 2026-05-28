"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CinematicIntro from "@/components/intro/CinematicIntro";
import ProfileSlides from "@/components/intro/ProfileSlides";
import TopBar from "@/components/hub/TopBar";
import HeroDashboard from "@/components/hub/HeroDashboard";
import ModuleGrid from "@/components/hub/ModuleGrid";
import ActivityFeed from "@/components/hub/ActivityFeed";
import FooterMap from "@/components/hub/FooterMap";
import BottomNav from "@/components/navigation/BottomNav";
import RingSystem from "@/components/feed/RingSystem";
import FeedGrid from "@/components/feed/FeedGrid";

type AppPhase = "intro" | "profiles" | "hub";

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("intro");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("explore"); // Default to explore in feed

  const nextPhase = () => {
    if (phase === "intro") setPhase("profiles");
    else if (phase === "profiles") setPhase("hub");
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <main className="min-h-screen bg-black text-foreground selection:bg-nova-cyan/30 overflow-x-hidden">
      {/* Background Atmosphere for Hub & Feed */}
      {phase === "hub" && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b] via-[#050505] to-black" />
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-repeat" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-nova-cyan/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-nova-purple/5 blur-[100px] rounded-full" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10"
          >
            <CinematicIntro onComplete={nextPhase} />
          </motion.div>
        )}

        {phase === "profiles" && (
          <motion.div
            key="profiles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10"
          >
            <ProfileSlides onComplete={nextPhase} />
          </motion.div>
        )}

        {phase === "hub" && (
          <motion.div
            key="hub"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative z-10"
          >
            <TopBar onLogin={handleLogin} isAuthenticated={isAuthenticated} />

            <div className="pt-4">
              {!isAuthenticated ? (
                /* MAIN HUB (DASHBOARD) - UNAUTHENTICATED */
                <motion.div
                  key="unauthenticated-hub"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="animate-in fade-in duration-1000"
                >
                  <HeroDashboard />
                  <ModuleGrid onAction={handleLogin} />
                  <ActivityFeed />
                  <FooterMap />
                </motion.div>
              ) : (
                /* MAIN HUB FEED - AUTHENTICATED */
                <motion.div
                  key="authenticated-feed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="pt-20"
                >
                  {activeTab === "explore" && (
                    <div className="animate-in fade-in duration-700">
                      <RingSystem />
                      <FeedGrid />
                    </div>
                  )}

                  {activeTab === "home" && (
                     <div className="px-6 py-10 text-center mt-20">
                        <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-nova-cyan mb-4">Command Center</h2>
                        <p className="text-white/40 text-sm">Synchronizing localized innovation data with your profile...</p>
                     </div>
                  )}

                  {activeTab !== "explore" && activeTab !== "home" && (
                    <div className="h-[60vh] flex items-center justify-center p-6 text-center">
                       <div className="max-w-xs">
                         <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-nova-cyan/30 flex items-center justify-center animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-nova-cyan/20 blur-sm" />
                         </div>
                         <h2 className="text-2xl font-bold mb-2 uppercase tracking-[0.3em] text-nova-cyan">{activeTab}</h2>
                         <p className="text-white/40 text-sm leading-relaxed">System Module Initializing...</p>
                       </div>
                    </div>
                  )}

                  {/* Nav tab only displays in feed (authenticated state) */}
                  <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
