"use client";

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Edit3,
  GitBranch,
  Send,
  BarChart3,
  Sparkles,
  Settings,
  Menu,
  X,
  Eye,
  Save,
  Rocket,
  ChevronLeft,
  Lock,
  Globe,
  ShieldAlert,
  MoreHorizontal,
  Share2,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Survey } from '@/lib/types/surveys';

interface WorkspaceShellProps {
  survey: Survey;
  children: React.ReactNode;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '' },
  { id: 'build', label: 'Build', icon: Edit3, path: '/build' },
  { id: 'logic', label: 'Logic', icon: GitBranch, path: '/logic' },
  { id: 'collect', label: 'Collect', icon: Send, path: '/collect' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { id: 'ai-lab', label: 'AI Lab', icon: Sparkles, path: '/ai-lab' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

const mobileNavItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '' },
  { id: 'build', label: 'Build', icon: Edit3, path: '/build' },
  { id: 'collect', label: 'Collect', icon: Send, path: '/collect' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
];

export default function WorkspaceShell({ survey, children }: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (!survey) {
     return (
       <div className="min-h-screen bg-black flex items-center justify-center p-8">
          <div className="text-center">
             <h2 className="text-xl font-bold mb-4">Workspace Load Error</h2>
             <button onClick={() => window.location.href = '/creator-surveys'} className="px-6 py-2 bg-nova-purple rounded-xl">Return to Hub</button>
          </div>
       </div>
     );
  }
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getActiveTab = () => {
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    if (lastSegment === survey.id) return 'overview';
    return lastSegment;
  };

  const activeTab = getActiveTab();

  const VisibilityIcon = survey.visibility === 'Public' ? Globe : survey.visibility === 'Invite Only' ? ShieldAlert : Lock;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row overflow-hidden font-sans selection:bg-nova-purple/30">

      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-72 flex-col border-r border-white/5 bg-white/[0.01] backdrop-blur-3xl z-40">
        <div className="p-8 flex flex-col h-full">
           <button
             onClick={() => router.push('/creator-surveys')}
             className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-10 group w-fit"
           >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit Workspace</span>
           </button>

           <nav className="space-y-1 flex-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <Link
                    key={item.id}
                    href={`/creator-surveys/${survey.id}${item.path}`}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all relative group ${
                      isActive
                      ? 'bg-nova-purple text-white shadow-[0_10px_20px_rgba(188,19,254,0.2)]'
                      : 'text-white/40 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} className={isActive ? 'animate-pulse' : ''} />
                    <span className="text-[11px] font-black uppercase tracking-[0.1em]">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white"
                      />
                    )}
                  </Link>
                );
              })}
           </nav>

           <div className="mt-8 p-6 rounded-[2rem] bg-gradient-to-br from-nova-cyan/10 to-transparent border border-white/5">
              <p className="text-[9px] text-white/40 uppercase tracking-widest mb-2 font-black">Node System</p>
              <div className="flex items-center justify-between">
                 <span className="text-xs font-black tracking-tighter">PHASE 1B</span>
                 <span className="text-[8px] px-2 py-0.5 rounded-full bg-nova-cyan/20 text-nova-cyan font-black">STABLE</span>
              </div>
           </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden">

        {/* 3. WORKSPACE HEADER */}
        <header className="h-24 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 lg:px-10 z-30 flex-shrink-0">
           <div className="flex items-center gap-6 min-w-0">
              <button
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                 <Menu size={20} />
              </button>

              <div className="min-w-0">
                 <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-lg font-black uppercase tracking-tight truncate max-w-[200px] lg:max-w-md">{survey.title}</h1>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                      survey?.status === 'published' ? 'bg-nova-green/20 text-nova-green' : 'bg-nova-cyan/20 text-nova-cyan'
                    }`}>
                       {survey?.status || 'DRAFT'}
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-white/20">
                       <VisibilityIcon size={12} />
                       <span className="text-[9px] font-bold uppercase tracking-widest">{survey?.visibility || 'Private'}</span>
                    </div>
                    <div className="h-3 w-px bg-white/10" />
                    <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest truncate max-w-[150px]">Project: {survey?.project_id ? 'Linked' : 'Global'}</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-2 lg:gap-4">
              {/* Auto-save Indicator */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 mr-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-nova-green animate-pulse" />
                 <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Sync Active</span>
              </div>

              <div className="flex items-center gap-2">
                 <button className="w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-all" title="Preview">
                    <Eye size={18} />
                 </button>
                 <button className="hidden lg:flex items-center justify-center gap-2 px-6 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all">
                    <Save size={14} />
                    <span>Save</span>
                 </button>
                 <button className="w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-all" title="Share Access">
                    <Share2 size={18} />
                 </button>
                 <button className="flex items-center justify-center gap-2 px-6 h-10 lg:h-11 rounded-xl bg-nova-purple text-white text-[10px] font-black uppercase tracking-widest hover:shadow-[0_10px_25px_rgba(188,19,254,0.3)] transition-all">
                    <Rocket size={14} />
                    <span className="hidden sm:inline">Publish</span>
                 </button>
                 <button className="w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-all">
                    <MoreHorizontal size={18} />
                 </button>
              </div>
           </div>
        </header>

        {/* 4. MAIN WORKSPACE CANVAS & 5. RIGHT CONTEXT PANEL */}
        <div className="flex-1 flex overflow-hidden relative">
           {/* Main Canvas */}
           <div className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar scroll-smooth bg-black/20">
              <div className="p-6 lg:p-10 max-w-5xl mx-auto pb-40 md:pb-20">
                 {children}
              </div>
           </div>

           {/* Right Context Panel (Desktop Only) */}
           <aside className="hidden xl:flex w-80 border-l border-white/5 bg-white/[0.01] flex-col p-8 space-y-8 overflow-y-auto">
              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-nova-cyan/10 flex items-center justify-center text-nova-cyan">
                       <Info size={16} />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest">Context Engine</h3>
                 </div>

                 <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-4">
                    <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-tight">
                       This panel provides context-aware tools and insights based on your active module.
                    </p>
                    <div className="pt-4 border-t border-white/5 space-y-3">
                       <div className="flex items-center justify-between">
                          <span className="text-[9px] text-white/20 uppercase font-black">Status</span>
                          <span className="text-[9px] text-nova-green font-black">OPTIMAL</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[9px] text-white/20 uppercase font-black">Last Sync</span>
                          <span className="text-[9px] text-white/40 font-black tracking-tighter">JUST NOW</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 px-2">Quick Actions</h4>
                 <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                    <Share2 size={16} className="text-white/20 group-hover:text-nova-cyan transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Share Access</span>
                 </button>
                 <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                    <CheckCircle2 size={16} className="text-white/20 group-hover:text-nova-green transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Run Diagnostics</span>
                 </button>
              </div>
           </aside>
        </div>

        {/* 6. STATUS BAR (Desktop Only) */}
        <footer className="hidden md:flex h-10 border-t border-white/5 bg-black/60 backdrop-blur-xl items-center justify-between px-6 z-30">
           <div className="flex items-center gap-6">
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">WORKSPACE V1.0B</span>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-nova-purple animate-pulse" />
                 <span className="text-[9px] font-bold text-nova-purple uppercase tracking-widest">INTELLIGENCE STREAM ACTIVE</span>
              </div>
           </div>
           <div className="flex items-center gap-4 text-white/20">
              <div className="flex items-center gap-2">
                 <AlertCircle size={10} />
                 <span className="text-[9px] font-bold uppercase tracking-widest">NO LATENCY DETECTED</span>
              </div>
           </div>
        </footer>

        {/* 7. MOBILE BOTTOM NAVIGATION */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around px-4 z-[60] safe-area-bottom">
           {mobileNavItems.map((item) => {
             const isActive = activeTab === item.id;
             return (
               <Link
                 key={item.id}
                 href={`/creator-surveys/${survey.id}${item.path}`}
                 className={`flex flex-col items-center gap-1.5 transition-all ${
                   isActive ? 'text-nova-purple' : 'text-white/30'
                 }`}
               >
                 <item.icon size={20} className={isActive ? 'scale-110' : ''} />
                 <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
               </Link>
             );
           })}
           <button
             className="flex flex-col items-center gap-1.5 text-white/30"
             onClick={() => setIsMobileMenuOpen(true)}
           >
              <MoreHorizontal size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest">More</span>
           </button>
        </nav>
      </main>

      {/* MOBILE DRAWER (Full Navigation) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-[#0A0A0A] border-r border-white/10 z-[110] md:hidden flex flex-col"
            >
               <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-nova-purple flex items-center justify-center">
                        <Rocket size={16} />
                     </div>
                     <span className="text-xs font-black uppercase tracking-widest">Node Map</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)}>
                     <X size={20} className="text-white/40" />
                  </button>
               </div>

               <div className="p-6 flex-1 overflow-y-auto">
                  <nav className="space-y-1">
                    {navItems.map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <Link
                          key={item.id}
                          href={`/creator-surveys/${survey.id}${item.path}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                            isActive
                            ? 'bg-nova-purple text-white shadow-lg'
                            : 'text-white/40 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <item.icon size={18} />
                          <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
               </div>

               <div className="p-8 border-t border-white/5 space-y-4">
                  <button
                    onClick={() => router.push('/creator-surveys')}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest border border-white/5"
                  >
                     <ChevronLeft size={16} />
                     Exit Workspace
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MOBILE STICKY ACTIONS */}
      <div className="md:hidden fixed bottom-24 right-6 flex flex-col gap-3 z-50 pointer-events-none">
         <button className="w-12 h-12 rounded-full bg-nova-purple text-white shadow-2xl flex items-center justify-center pointer-events-auto active:scale-90 transition-transform">
            <Rocket size={20} />
         </button>
         <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl flex items-center justify-center pointer-events-auto active:scale-90 transition-transform">
            <Save size={20} />
         </button>
      </div>

    </div>
  );
}
