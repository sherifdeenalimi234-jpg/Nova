"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldCheck,
  FileText,
  Users,
  BarChart3,
  Settings,
  Terminal
} from 'lucide-react';
import LogoutButton from './LogoutButton';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Creators', href: '/admin/creators', icon: ShieldCheck },
  { name: 'Content', href: '/admin/content', icon: FileText },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Surveys', href: '/admin/surveys', icon: BarChart3 },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col bg-black border-r border-white/10 p-6 z-50">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg bg-nova-cyan flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.5)]">
          <Terminal size={18} className="text-black" />
        </div>
        <div className="font-black tracking-[0.2em] text-white uppercase text-sm">
          Nova <span className="text-nova-cyan">Admin</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                isActive
                  ? "bg-nova-cyan/10 text-nova-cyan border border-nova-cyan/20"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={20} className={cn(
                "transition-transform group-hover:scale-110",
                isActive ? "text-nova-cyan" : "text-white/20 group-hover:text-white/60"
              )} />
              <span className="text-sm font-bold uppercase tracking-widest">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-nova-cyan shadow-[0_0_8px_#00f2ff]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        <Link
          href="/admin/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all mb-2",
            pathname === '/admin/settings' && "bg-white/5 text-white"
          )}
        >
          <Settings size={20} />
          <span className="text-sm font-bold uppercase tracking-widest">Settings</span>
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
