"use client";

import React, { useState } from "react";
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
  const [activeTab, setActiveTab] = useState("home");

  const nextPhase = () => {
    if (phase === "intro") setPhase("profiles");
    else if (phase === "profiles") setPhase("hub");
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-nova-cyan/30">
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
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
            className="relative"
          >
            <TopBar />

            <div className="pt-4">
              {activeTab === "home" && (
                <>
                  <HeroDashboard />
                  <ModuleGrid />
                  <ActivityFeed />
                  <FooterMap />
                </>
              )}

              {activeTab === "explore" && (
                <div className="pt-20">
                   <RingSystem />
                   <FeedGrid />
                </div>
              )}

              {/* Placeholder for other tabs */}
              {activeTab !== "home" && activeTab !== "explore" && (
                <div className="h-screen flex items-center justify-center p-6 text-center">
                   <div>
                     <h2 className="text-2xl font-bold mb-2 uppercase tracking-widest text-nova-cyan">{activeTab}</h2>
                     <p className="text-white/40">This module is currently initializing in the NOVA ecosystem.</p>
                   </div>
                </div>
              )}
            </div>

            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
