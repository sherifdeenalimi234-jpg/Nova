import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
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
  MessageSquare,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import MobileNav from '@/components/creator/MobileNav';

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, creator_profiles(*)')
    .eq('id', user.id)
    .single();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/creator' },
    { name: 'Posts', icon: FileText, href: '/creator/posts' },
    { name: 'Surveys', icon: Search, href: '/creator/surveys' },
    { name: 'Analytics', icon: BarChart3, href: '/creator/analytics' },
    { name: 'Portfolio', icon: User, href: '/creator/portfolio' },
    { name: 'Settings', icon: Settings, href: '/creator/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
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
               className="flex items-center gap-4 px-6 py-4 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all group"
             >
                <item.icon size={18} className="group-hover:text-nova-cyan transition-colors" />
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

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen pt-16 lg:pt-0 pb-20 lg:pb-0">
        {/* Top Header */}
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

        <div className="p-8">
           {children}
        </div>
      </main>

      {/* Mobile Navigation & Top Bar */}
      <MobileNav profile={profile} />
    </div>
  );
}
