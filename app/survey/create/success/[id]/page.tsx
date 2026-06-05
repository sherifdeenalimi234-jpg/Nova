"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Copy,
  Eye,
  LayoutDashboard,
  Share2,
  Check,
  ChevronRight,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function SurveySuccessPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [copied, setCopied] = useState(false);
  const surveyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/survey/${id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 pt-24">
      <div className="w-full max-w-2xl text-center space-y-12">
        {/* Animated Success Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="w-32 h-32 rounded-full bg-nova-green/10 border border-nova-green/20 flex items-center justify-center mx-auto relative"
        >
           <div className="absolute inset-0 rounded-full bg-nova-green/20 animate-ping" />
           <CheckCircle2 size={64} className="text-nova-green relative z-10" />
        </motion.div>

        {/* Text Content */}
        <div className="space-y-4">
           <motion.h1
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="text-4xl font-black uppercase tracking-tight text-white italic"
           >
              Protocol <span className="text-nova-green">De-Cloaked</span>
           </motion.h1>
           <motion.p
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="text-white/40 text-[10px] uppercase tracking-[0.5em] font-medium"
           >
              Intelligence Matrix Successfully Deployed To Ecosystem
           </motion.p>
        </div>

        {/* Action Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="p-10 rounded-[3rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl space-y-8"
        >
           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Discovery Link</label>
              <div className="flex items-center gap-3 p-2 bg-black/40 border border-white/5 rounded-2xl">
                 <div className="flex-1 px-4 py-3 text-xs text-white/60 truncate font-mono">
                    {surveyUrl}
                 </div>
                 <button
                   onClick={copyToClipboard}
                   className={cn(
                     "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                     copied ? "bg-nova-green text-white" : "bg-white/5 text-white hover:bg-white/10"
                   )}
                 >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy"}
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href={`/survey/${id}`}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center gap-3 hover:bg-white/10 transition-all group"
              >
                 <Eye size={18} className="text-nova-cyan group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Preview Live Node</span>
              </Link>
              <Link
                href="/survey/dashboard"
                className="p-5 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center gap-3 hover:bg-white/10 transition-all group"
              >
                 <LayoutDashboard size={18} className="text-nova-purple group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Mission Control</span>
              </Link>
           </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-6 text-[9px] font-black uppercase tracking-widest text-white/20"
        >
           <div className="flex items-center gap-2">
              <Globe size={12} />
              Public Discovery
           </div>
           <div className="w-1 h-1 rounded-full bg-white/10" />
           <div className="flex items-center gap-2">
              <Share2 size={12} />
              Shareable Signal
           </div>
        </motion.div>
      </div>
    </div>
  );
}
