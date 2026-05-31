"use client";

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProjectTopBarProps {
  title: string;
  showBack?: boolean;
}

const ProjectTopBar: React.FC<ProjectTopBarProps> = ({ title, showBack = true }) => {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-xl border-b border-white/5 z-50 flex items-center px-4">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-white/60 hover:text-nova-cyan transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      <h1 className="ml-2 text-sm font-black uppercase tracking-widest">{title}</h1>
    </header>
  );
};

export default ProjectTopBar;
