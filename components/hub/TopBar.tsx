"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, LogIn, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TopBarProps {
  onLogin?: () => void;
  isAuthenticated?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onLogin, isAuthenticated }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const supabase = createClient();

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    if (onLogin) {
      try {
        await onLogin();
      } catch (err) {
        setIsLoggingIn(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Error logging in:', error.message);
        setIsLoggingIn(false);
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex items-center justify-between glass border-t-0 border-x-0 border-b-white/5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 bg-nova-cyan rounded-lg rotate-45 shadow-[0_0_15px_rgba(0,242,255,0.4)]" />
          <div className="absolute inset-0 w-8 h-8 bg-nova-cyan rounded-lg rotate-45 animate-ping opacity-20" />
        </div>
        <span className="font-black tracking-[0.4em] text-xl text-white">NOVA</span>
      </div>

      {!isAuthenticated ? (
        <button
          onClick={handleSignIn}
          disabled={isLoggingIn}
          className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-nova-cyan/20 to-nova-purple/20 border border-nova-cyan/30 hover:border-nova-cyan/60 transition-all group active:scale-95 disabled:opacity-50"
        >
          {isLoggingIn ? (
            <Loader2 size={16} className="animate-spin text-nova-cyan" />
          ) : (
            <LogIn size={16} className="text-nova-cyan group-hover:translate-x-1 transition-transform" />
          )}
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Sign In</span>
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-bold text-white uppercase tracking-wider">Authenticated</div>
            <div className="text-[8px] text-nova-cyan uppercase tracking-widest">Active Node</div>
          </div>
          <Link href="/settings/profile" className="block">
            <div className="w-10 h-10 rounded-xl border border-nova-cyan/40 p-0.5 bg-nova-cyan/5 hover:border-nova-cyan/80 transition-all cursor-pointer">
               <div className="w-full h-full rounded-lg bg-gradient-to-br from-nova-cyan/40 to-nova-purple/40 flex items-center justify-center">
                  <User size={18} className="text-white" />
               </div>
            </div>
          </Link>
        </div>
      )}
    </header>
  );
};

export default TopBar;
