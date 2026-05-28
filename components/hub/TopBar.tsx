"use client";

import React from "react";
import { User } from "lucide-react";

const TopBar = () => {
  const handleSignIn = () => {
    // In a real app, this would trigger Google OAuth
    console.log("Redirecting to Google Sign-In...");
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between glass border-t-0 border-x-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-nova-cyan rounded-sm animate-pulse shadow-[0_0_10px_#00f2ff]" />
        <span className="font-bold tracking-widest text-lg">NOVA</span>
      </div>

      <button
        onClick={handleSignIn}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
      >
        <span className="text-xs font-medium uppercase tracking-wider text-white/80 group-hover:text-white">Sign In</span>
        <div className="w-6 h-6 rounded-full bg-nova-cyan/20 flex items-center justify-center">
          <User size={14} className="text-nova-cyan" />
        </div>
      </button>
    </header>
  );
};

export default TopBar;
