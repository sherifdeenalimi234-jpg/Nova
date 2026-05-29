import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-black text-white font-sans selection:bg-nova-cyan/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-nova-cyan/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-nova-purple/5 blur-[120px] rounded-full" />
      </div>

      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 relative">
        {/* Top Status Bar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-nova-green animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">System Online</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="text-[10px] font-mono text-nova-cyan/60 uppercase tracking-widest">
              L7_Ecosystem_Secure_V.1
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[9px] font-black uppercase tracking-widest text-white/30 leading-none">Intelligence Node</div>
              <div className="text-xs font-bold text-white uppercase tracking-tighter">Mission Control</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-nova-cyan/20 to-nova-purple/20 border border-white/10 flex items-center justify-center text-[10px] font-black">
              AD
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
