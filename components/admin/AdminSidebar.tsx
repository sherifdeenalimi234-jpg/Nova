"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldCheck,
  FileText,
  Users,
  BarChart3,
  Settings,
  Terminal,
  X,
  LogOut,
  Bell,
  Activity,
  Mail
} from 'lucide-react';
import LogoutButton from './LogoutButton';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Email Whitelist', href: '/admin/whitelist', icon: Mail },
  { name: 'Posts', href: '/admin/content', icon: FileText },
  { name: 'Surveys', href: '/admin/surveys', icon: BarChart3 },
  { name: 'Analytics', href: '/admin/analytics', icon: Activity },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
];

export default function AdminSidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-nova-cyan flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.5)]">
            <Terminal size={18} className="text-black" />
          </div>
          <div className="font-black tracking-[0.2em] text-white uppercase text-sm">
            Nova <span className="text-nova-cyan">Admin</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group",
                isActive
                  ? "bg-nova-cyan/10 text-nova-cyan border border-nova-cyan/20"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={20} className={cn(
                "transition-transform group-hover:scale-110",
                isActive ? "text-nova-cyan" : "text-white/20 group-hover:text-white/60"
              )} />
              <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-nova-cyan shadow-[0_0_8px_#00f2ff]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
        <Link
          href="/admin/settings"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all",
            pathname === '/admin/settings' && "bg-white/5 text-white"
          )}
        >
          <Settings size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Settings</span>
        </Link>
        <LogoutButton />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen sticky top-0 flex-col bg-black border-r border-white/10 p-6 z-50">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-black/90 backdrop-blur-2xl border-r border-white/10 p-6 z-[70] lg:hidden shadow-[20px_0_50px_rgba(0,0,0,0.5)]"
            >
              {/* Subtle Cyan Glow */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-64 bg-nova-cyan/10 blur-[100px] pointer-events-none" />
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
