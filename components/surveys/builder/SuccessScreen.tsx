"use client";

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Link as LinkIcon,
  ExternalLink,
  LayoutDashboard,
  Copy,
  PartyPopper
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface SuccessScreenProps {
  surveyId: string;
  surveyTitle: string;
}

export default function SuccessScreen({ surveyId, surveyTitle }: SuccessScreenProps) {
  const [copied, setCopied] = useState(false);
  const surveyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/surveys/${surveyId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="relative inline-block mb-8">
            <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto relative z-10">
                <PartyPopper className="w-12 h-12 text-cyan-400" />
            </div>
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-cyan-500 rounded-full blur-2xl z-0"
            />
        </div>

        <h1 className="text-3xl font-black text-white mb-3">Survey Published!</h1>
        <p className="text-zinc-500 mb-8 px-4">
          Great work! Your survey <span className="text-white font-bold">"{surveyTitle}"</span> is now live and ready to collect responses.
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-3">
             <div className="flex-1 overflow-hidden">
                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-0.5 text-left ml-1">Survey Link</p>
                <p className="text-sm text-zinc-300 truncate text-left ml-1">{surveyUrl}</p>
             </div>
             <button
                onClick={copyToClipboard}
                className={`p-3 rounded-xl transition-all ${copied ? 'bg-green-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
             >
                {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
             </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Link
                href={`/surveys/${surveyId}`}
                className="w-full py-4 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all"
            >
                View Public Survey
                <ExternalLink className="w-5 h-5" />
            </Link>
            <Link
                href="/creator-surveys"
                className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
            >
                Return to Dashboard
                <LayoutDashboard className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
