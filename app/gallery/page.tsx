"use client";

import React from 'react';
import { ImageIcon, Info } from 'lucide-react';

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 pt-24">
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Gallery</h1>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Visual innovation archive</p>
      </header>

      <div className="h-[50vh] flex flex-col items-center justify-center glass rounded-[3rem] border-white/5 border-dashed">
         <ImageIcon className="text-white/10 mb-6 animate-pulse" size={64} />
         <h2 className="text-xl font-bold uppercase tracking-widest mb-2">Archive Synchronizing</h2>
         <p className="text-white/40 text-xs text-center max-w-xs leading-relaxed">
           The visual asset repository is currently indexing new research signals. Please re-access this node in the next cycle.
         </p>

         <div className="mt-12 flex items-center gap-3 text-[10px] text-nova-cyan font-black uppercase tracking-widest">
            <Info size={14} /> Phase 1 Foundation Complete
         </div>
      </div>
    </div>
  );
}
