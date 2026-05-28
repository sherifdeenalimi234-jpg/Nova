"use client";

import React, { useState } from "react";
import { Home, Compass, Cpu, User, MoreHorizontal, X, LayoutGrid, ClipboardList, ImageIcon, BarChart3, Bell, Settings, HelpCircle, LogOut, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "explore", icon: Compass, label: "Explore" },
    { id: "ai", icon: Cpu, label: "AI", special: true },
    { id: "profile", icon: User, label: "Profile" },
    { id: "more", icon: MoreHorizontal, label: "More" },
  ];

  const moreItems = [
    { label: "Projects", icon: LayoutGrid },
    { label: "Surveys", icon: ClipboardList },
    { label: "Gallery", icon: ImageIcon },
    { label: "Analytics", icon: BarChart3 },
    { label: "Notifications", icon: Bell },
    { label: "Settings", icon: Settings },
    { label: "Help Center", icon: HelpCircle },
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === "more") {
      setIsMoreOpen(true);
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full z-[60] px-4 pb-6 pt-2">
        <div className="glass rounded-[2rem] flex items-center justify-between px-2 py-2 shadow-2xl border-white/20">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center flex-1 py-2 gap-1 transition-all relative ${
                  isActive ? "text-nova-cyan" : "text-white/40"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-nova-cyan shadow-[0_0_10px_#00f2ff]"
                  />
                )}
                <div className={`relative ${tab.special ? "p-3 bg-nova-cyan/10 rounded-full -mt-6 border border-nova-cyan/30 shadow-[0_0_20px_rgba(0,242,255,0.2)]" : ""}`}>
                  <tab.icon size={tab.special ? 24 : 20} className={`${isActive ? "animate-pulse" : ""}`} />
                </div>
                <span className="text-[10px] font-medium tracking-widest uppercase">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <AnimatePresence>
        {isMoreOpen && (
          <div className="fixed inset-0 z-[100]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-[#0a0a0a] rounded-t-[3rem] border-t border-white/10 px-6 pt-6 pb-12"
            >
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="flex items-center gap-2 text-white/40 hover:text-white"
                >
                  <ChevronLeft size={20} />
                  <span className="text-xs uppercase tracking-[0.2em]">Back to Feed</span>
                </button>
                <div className="w-12 h-1.5 bg-white/10 rounded-full" />
                <div className="w-10" /> {/* Spacer */}
              </div>

              <div className="grid grid-cols-4 gap-y-8 gap-x-2">
                {moreItems.map((item, index) => (
                  <button key={index} className="flex flex-col items-center gap-3 group">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-active:scale-90 transition-transform">
                      <item.icon size={24} className="text-white/60 group-hover:text-nova-cyan transition-colors" />
                    </div>
                    <span className="text-[10px] text-white/40 uppercase tracking-tighter text-center">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-white/5">
                <button className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 active:scale-95 transition-transform">
                  <LogOut size={20} />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">Logout Session</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BottomNav;
