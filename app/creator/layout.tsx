"use client";

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  BarChart3,
  Settings,
  User,
  LogOut,
  PlusCircle,
  Bell,
  Search,
  Globe,
  Menu,
  X,
  ChevronRight,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { usePathname } from 'next/navigation';

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    }
    getUser();
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/creator' },
    { name: 'Posts', icon: FileText, href: '/creator/posts' },
    { name: 'Projects', icon: Briefcase, href: '/creator/projects' },
    { name: 'Surveys', icon: Search, href: '/creator/surveys' },
    { name: 'Analytics', icon: BarChart3, href: '/creator/analytics' },
    { name: 'Portfolio', icon: User, href: '/creator/portfolio' },
    { name: 'Settings', icon: Settings, href: '/creator/settings' },
  ];

  const bottomNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/creator' },
    { name: 'Posts', icon: FileText, href: '/creator/posts' },
    { name: 'Projects', icon: Briefcase, href: '/creator/projects' },
    { name: 'Search/Discover', icon: Search, href: '/creator/surveys' },
    { name: 'Analytics', icon: BarChart3, href: '/creator/analytics' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-black/50 backdrop-blur-3xl fixed inset-y-0 left-0 z-50 flex flex-col hidden lg:flex">
        <div className="p-8">
          <Link href="/feed" className="flex items-center gap-3 group">
             <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-nova-cyan to-nova-purple flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all">
                <Globe size={20} className="text-black" />
             </div>
             <div>
                <span className="block text-sm font-black uppercase tracking-widest">NOVA</span>
                <span className="block text-[8px] text-nova-cyan font-black uppercase tracking-[0.3em]">Creator Studio</span>
             </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
           {menuItems.map((item) => (
             <Link
               key={item.name}
               href={item.href}
               className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${
                 pathname === item.href ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
               }`}
             >
                <item.icon size={18} className={pathname === item.href ? "text-nova-cyan" : "group-hover:text-nova-cyan transition-colors"} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.name}</span>
             </Link>
           ))}
        </nav>

        <div className="p-8 border-t border-white/5 space-y-4">
           <Link href="/feed" className="flex items-center gap-4 px-6 py-4 rounded-2xl text-white/40 hover:text-white transition-all">
              <LogOut size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit Studio</span>
           </Link>

           <div className="p-4 rounded-3xl bg-gradient-to-br from-nova-cyan/10 to-nova-purple/10 border border-white/5">
              <p className="text-[9px] font-black uppercase tracking-widest text-nova-cyan mb-1">Verified Status</p>
              <p className="text-[8px] text-white/40 uppercase tracking-widest">Innovation Node Active</p>
           </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden h-20 border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-[60] flex items-center justify-between px-6">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 text-white/60 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>

        <Link href="/creator" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-nova-cyan to-nova-purple flex items-center justify-center">
            <Globe size={16} className="text-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest leading-none">NOVA</span>
            <span className="text-[7px] text-nova-cyan font-black uppercase tracking-[0.2em] leading-none mt-0.5">Creator Studio</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <button className="p-2 text-white/60 hover:text-white transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-nova-cyan" />
          </button>
          <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-white/5">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={14} className="text-white/20" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Hamburger Menu) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[80%] max-w-sm bg-[#050505] border-r border-white/10 z-[80] lg:hidden flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-nova-cyan to-nova-purple flex items-center justify-center">
                    <Globe size={20} className="text-black" />
                  </div>
                  <div>
                    <span className="block text-sm font-black uppercase tracking-widest">NOVA</span>
                    <span className="block text-[8px] text-nova-cyan font-black uppercase tracking-[0.3em]">Creator Studio</span>
                  </div>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-white/40">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${
                      pathname === item.href ? "bg-white/5 border border-white/10 text-white" : "text-white/40 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={18} className={pathname === item.href ? "text-nova-cyan" : "text-white/20"} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.name}</span>
                    </div>
                    <ChevronRight size={14} className="text-white/10" />
                  </Link>
                ))}
              </nav>

              <div className="p-8 border-t border-white/5 space-y-4">
                <Link
                  href="/feed"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all"
                >
                  <LogOut size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit Studio</span>
                </Link>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-nova-cyan/5 to-nova-purple/5 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={12} className="text-nova-cyan" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-nova-cyan">Verified Status</span>
                  </div>
                  <p className="text-[8px] text-white/40 uppercase tracking-[0.2em]">Innovation Node Active</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen pb-24 lg:pb-0">
        {/* Desktop Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-xl sticky top-0 z-40 hidden lg:flex">
           <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Ecosystem Production</h2>
           </div>

           <div className="flex items-center gap-6">
              <button className="relative p-2 text-white/40 hover:text-white transition-colors">
                 <Bell size={20} />
                 <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-nova-cyan" />
              </button>
              <button className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                 <div className="w-6 h-6 rounded-lg bg-nova-cyan/20 flex items-center justify-center">
                    <PlusCircle size={14} className="text-nova-cyan" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest">New Build</span>
              </button>
           </div>
        </header>

        <div className="p-6 lg:p-8">
           {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-3xl border-t border-white/10 z-[60] flex items-center justify-around px-2">
         {bottomNavItems.map((item) => {
           const isActive = pathname === item.href;
           return (
             <Link
               key={item.name}
               href={item.href}
               className={`flex flex-col items-center gap-1.5 px-2 transition-all ${
                 isActive ? "text-nova-cyan" : "text-white/40 hover:text-white"
               }`}
             >
                <div className={`p-2 rounded-xl transition-all ${isActive ? "bg-nova-cyan/10" : ""}`}>
                  <item.icon size={20} />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest">{item.name}</span>
             </Link>
           );
         })}
      </nav>
    </div>
  );
}
