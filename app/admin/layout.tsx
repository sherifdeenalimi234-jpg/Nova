"use client";

import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Menu, Terminal } from 'lucide-react';
import * as motion from 'framer-motion/client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-black text-white font-sans selection:bg-nova-cyan/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] md:w-[40%] h-[40%] bg-nova-cyan/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] md:w-[40%] h-[40%] bg-nova-purple/5 blur-[120px] rounded-full" />
      </div>

      {/* Sidebar Navigation (Desktop & Mobile) */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col min-w-0">
        {/* Top Header - Mobile First */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-black/50 backdrop-blur-xl sticky top-0 z-40 w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-white/60 hover:text-white transition-colors"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-nova-cyan flex lg:hidden items-center justify-center shadow-[0_0_10px_rgba(0,242,255,0.3)]">
                <Terminal size={14} className="text-black" />
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nova-green animate-pulse hidden xs:block" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">System Online</span>
                </div>
                <div className="h-4 w-px bg-white/10 hidden lg:block" />
                <div className="text-[9px] md:text-[10px] font-mono text-nova-cyan/60 uppercase tracking-widest hidden sm:block">
                  L7_Ecosystem_V.1
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden xs:block">
              <div className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/30 leading-none">Intelligence Node</div>
              <div className="text-[10px] md:text-xs font-bold text-white uppercase tracking-tighter">Mission Control</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-nova-cyan/20 to-nova-purple/20 border border-white/10 flex items-center justify-center text-[10px] font-black shrink-0">
              AD
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-4 md:p-8 flex-1 w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
