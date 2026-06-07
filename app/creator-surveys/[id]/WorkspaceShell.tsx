"use client";

import React, { useState } from 'react';
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
  Plus
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
  { id: 'build', label: 'Build', icon: Edit3, path: '/architect' },
  { id: 'logic', label: 'Logic', icon: GitBranch, path: '/logic' },
  { id: 'collect', label: 'Collect', icon: Send, path: '/collect' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { id: 'ai-lab', label: 'AI Lab', icon: Sparkles, path: '/ai-lab' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function WorkspaceShell({ survey, children }: WorkspaceShellProps) {
  const pathname = usePathname();

  if (!survey) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto">
            <X size={32} />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-tight">Workspace Error</h2>
          <p className="text-white/40 text-xs uppercase tracking-widest">Survey data stream not found</p>
          <button
            onClick={() => window.location.href = '/creator-surveys'}
            className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest"
          >
            Return to Hub
          </button>
        </div>
      </div>
    );
  }

  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getActiveTab = () => {
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    if (lastSegment === survey.id) return 'overview';
    return lastSegment;
  };

  const activeTab = getActiveTab();

  const VisibilityIcon = survey.visibility === 'Public' ? Globe : survey.visibility === 'Invite Only' ? ShieldAlert : Lock;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r border-white/5 bg-white/[0.01] backdrop-blur-3xl z-40">
        <div className="p-8">
           <button
             onClick={() => router.push('/creator-surveys')}
             className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-10 group"
           >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Back to Hub</span>
           </button>

           <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <Link
                    key={item.id}
                    href={`/creator-surveys/${survey.id}${item.path}`}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                      isActive
                      ? 'bg-nova-purple text-white shadow-[0_10px_20px_rgba(188,19,254,0.2)]'
                      : 'text-white/40 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="text-[11px] font-black uppercase tracking-[0.1em]">{item.label}</span>
                  </Link>
                );
              })}
           </nav>
        </div>

        <div className="mt-auto p-8">
           <div className="p-6 rounded-[2rem] bg-gradient-to-br from-nova-cyan/10 to-transparent border border-white/5">
              <p className="text-[9px] text-white/40 uppercase tracking-widest mb-2 font-medium">Node Version</p>
              <div className="flex items-center justify-between">
                 <span className="text-xs font-bold">V1.0.0</span>
                 <span className="text-[8px] px-2 py-0.5 rounded-full bg-nova-cyan/20 text-nova-cyan font-black">LATEST</span>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden">

        {/* Header */}
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
                    <h1 className="text-lg font-black uppercase tracking-tight truncate">{survey.title}</h1>
                    <div className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${
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
                    <div className="h-3 w-px bg-white/10 hidden sm:block" />
                    <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest hidden sm:block truncate max-w-[200px]">Project ID: {survey?.project_id || 'Global'}</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-2 lg:gap-4">
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 mr-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-nova-green animate-pulse" />
                 <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Auto-saved</span>
              </div>

              <div className="flex items-center gap-2">
                 <button className="w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-all">
                    <Eye size={18} />
                 </button>
                 <button className="hidden lg:flex items-center justify-center gap-2 px-6 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all">
                    <Save size={14} />
                    <span>Save</span>
                 </button>
                 <button className="flex items-center justify-center gap-2 px-6 h-10 lg:h-11 rounded-xl bg-nova-purple text-white text-[10px] font-black uppercase tracking-widest hover:shadow-[0_10px_25px_rgba(188,19,254,0.3)] transition-all">
                    <Rocket size={14} />
                    <span className="hidden sm:inline">Publish</span>
                 </button>
              </div>
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar scroll-smooth">
           <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-32 md:pb-20">
              {children}
           </div>
        </div>

        {/* Status Bar */}
        <footer className="hidden md:flex h-10 border-t border-white/5 bg-black/60 backdrop-blur-xl items-center justify-between px-6 z-30">
           <div className="flex items-center gap-6">
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Environment: V1.0 - ALPHA</span>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-nova-purple" />
                 <span className="text-[9px] font-bold text-nova-purple uppercase tracking-widest">Workspace Stable</span>
              </div>
           </div>
           <div className="flex items-center gap-4 text-white/20">
              <span className="text-[9px] font-bold uppercase tracking-widest">Build Module Active</span>
              <span className="text-[9px] font-bold uppercase tracking-widest">Lat: 24ms</span>
           </div>
        </footer>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around px-4 z-[60] safe-area-bottom">
           {navItems.filter(i => ['overview', 'build', 'collect', 'analytics'].includes(i.id)).map((item) => {
             const isActive = activeTab === item.id;
             return (
               <Link
                 key={item.id}
                 href={`/creator-surveys/${survey.id}${item.path}`}
                 className={`flex flex-col items-center gap-1.5 transition-all ${
                   isActive ? 'text-nova-purple' : 'text-white/30'
                 }`}
               >
                 <item.icon size={20} />
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

      {/* Mobile Drawer */}
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
                     <span className="text-xs font-black uppercase tracking-widest">Workspace</span>
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
                            ? 'bg-nova-purple text-white'
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

               <div className="p-8 border-t border-white/5">
                  <button
                    onClick={() => router.push('/creator-surveys')}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest"
                  >
                     <ChevronLeft size={16} />
                     Exit Workspace
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
