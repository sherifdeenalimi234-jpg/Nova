"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Search,
  Settings,
  PlusCircle,
  LogOut,
  Globe,
  LayoutGrid,
  FileSpreadsheet
} from 'lucide-react';

const menuItems = [
  { name: 'Survey Hub', icon: LayoutGrid, href: '/creator-surveys' },
  { name: 'Live Surveys', icon: Globe, href: '/creator-surveys/live' },
  { name: 'Analytics', icon: BarChart3, href: '/creator-surveys/analytics' },
  { name: 'Collection', icon: FileSpreadsheet, href: '/creator-surveys/collection' },
  { name: 'Settings', icon: Settings, href: '/creator-surveys/settings' },
];

export default function SurveyNav() {
  const pathname = usePathname();

  return (
    <aside className="w-72 border-r border-white/5 bg-black/50 backdrop-blur-3xl fixed inset-y-0 left-0 z-50 flex flex-col hidden lg:flex">
      <div className="p-8">
        <Link href="/creator-surveys" className="flex items-center gap-3 group">
           <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-nova-purple to-nova-cyan flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(188,19,254,0.4)] transition-all">
              <FileSpreadsheet size={20} className="text-black" />
           </div>
           <div>
              <span className="block text-sm font-black uppercase tracking-widest text-white">Nova</span>
              <span className="block text-[8px] text-nova-purple font-black uppercase tracking-[0.3em]">Survey Platform</span>
           </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
         {menuItems.map((item) => {
           const isActive = pathname === item.href;
           return (
             <Link
               key={item.name}
               href={item.href}
               className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${
                 isActive
                 ? 'bg-nova-purple/10 text-nova-purple border border-nova-purple/20'
                 : 'text-white/40 hover:text-white hover:bg-white/5'
               }`}
             >
                <item.icon size={18} className={isActive ? 'text-nova-purple' : 'group-hover:text-nova-purple transition-colors'} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.name}</span>
             </Link>
           );
         })}
      </nav>

      <div className="p-8 border-t border-white/5 space-y-4">
         <Link href="/feed" className="flex items-center gap-4 px-6 py-4 rounded-2xl text-white/40 hover:text-white transition-all">
            <LogOut size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit Platform</span>
         </Link>

         <div className="p-4 rounded-3xl bg-gradient-to-br from-nova-purple/10 to-nova-cyan/10 border border-white/5">
            <p className="text-[9px] font-black uppercase tracking-widest text-nova-purple mb-1">Intelligence Status</p>
            <p className="text-[8px] text-white/40 uppercase tracking-widest">Survey Node Connected</p>
         </div>
      </div>
    </aside>
  );
}
