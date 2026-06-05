"use client";

import React, { useState } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Briefcase,
  BarChart3,
  Settings,
  User,
  LogOut,
  Bell,
  Search,
  Globe,
  PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavProps {
  profile: any;
}

const MobileNav: React.FC<MobileNavProps> = ({ profile }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/creator' },
    { name: 'Posts', icon: FileText, href: '/creator/posts' },
    { name: 'Surveys', icon: Search, href: '/creator/surveys' },
    { name: 'Analytics', icon: BarChart3, href: '/creator/analytics' },
    { name: 'Portfolio', icon: User, href: `/u/${profile?.custom_url || profile?.id}` },
    { name: 'Settings', icon: Settings, href: '/creator/settings' },
  ];

  const bottomItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/creator' },
    { name: 'Surveys', icon: Search, href: '/creator/surveys' },
    { name: 'Create', icon: PlusCircle, href: '/creator/surveys/new' },
    { name: 'Analytics', icon: BarChart3, href: '/creator/analytics' },
    { name: 'Portfolio', icon: User, href: `/u/${profile?.custom_url || profile?.id}` },
  ];

  const drawerVariants: Variants = {
    closed: { x: '-100%', transition: { type: 'spring', damping: 25, stiffness: 200 } },
    open: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } }
  };

  const overlayVariants: Variants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 text-white/60 hover:text-nova-cyan transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">NOVA</span>
            <span className="text-[7px] text-nova-cyan font-black uppercase tracking-[0.2em]">Creator Studio</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-white/40 hover:text-white transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-nova-cyan" />
          </button>
          <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-white/5">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={14} className="text-white/20" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={drawerVariants}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#050505] border-r border-white/5 z-[70] lg:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-nova-cyan to-nova-purple flex items-center justify-center">
                    <Globe size={16} className="text-black" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Nova Studio</span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsDrawerOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                        isActive ? 'bg-nova-cyan/10 text-nova-cyan' : 'text-white/40 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon size={18} className={isActive ? 'text-nova-cyan' : 'group-hover:text-nova-cyan transition-colors'} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-white/5 space-y-4">
                <Link
                  href="/feed"
                  className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
                >
                  <LogOut size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit Studio</span>
                </Link>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-nova-cyan/5 to-nova-purple/5 border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-nova-cyan animate-pulse" />
                    <p className="text-[8px] font-black uppercase tracking-widest text-nova-cyan">Verified Status</p>
                  </div>
                  <p className="text-[7px] text-white/30 uppercase tracking-[0.2em] ml-3.5">Innovation Node Active</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-2xl border-t border-white/10 z-[50] flex items-center justify-around px-2">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive ? 'text-nova-cyan' : 'text-white/30 hover:text-white/60'
              } ${item.name === 'Create' ? 'relative -mt-10' : ''}`}
            >
              <div className={`relative transition-all flex flex-col items-center gap-1 ${isActive ? 'scale-110' : ''}`}>
                {item.name === 'Create' ? (
                  <div className="w-12 h-12 rounded-full bg-nova-purple flex items-center justify-center text-white shadow-[0_0_20px_rgba(112,0,255,0.4)] border-4 border-[#050505]">
                    <PlusCircle size={24} />
                  </div>
                ) : (
                  <item.icon size={18} />
                )}
                {isActive && item.name !== 'Create' && (
                  <motion.div
                    layoutId="activeTabMobile"
                    className="absolute -top-1 -right-1 w-1 h-1 bg-nova-cyan rounded-full shadow-[0_0_8px_#00f2ff]"
                  />
                )}
              </div>
              <span className={`text-[7px] font-black uppercase tracking-tighter ${item.name === 'Create' ? 'mt-1' : ''}`}>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default MobileNav;
