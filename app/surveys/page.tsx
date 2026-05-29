"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ClipboardList, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSurveys() {
      const supabase = createClient();
      const { data } = await supabase
        .from('surveys')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (data) setSurveys(data);
      setLoading(false);
    }
    fetchSurveys();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="text-nova-cyan animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 pt-24">
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Surveys</h1>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Community Intelligence Gathering</p>
      </header>

      {surveys.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border-white/5">
           <ClipboardList className="mx-auto mb-4 text-white/10" size={48} />
           <p className="text-white/20 uppercase tracking-widest text-sm">No active surveys at this time</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {surveys.map((survey) => (
            <motion.div
              key={survey.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-8 rounded-[2.5rem] border-white/5 flex flex-col justify-between hover:border-nova-purple/30 transition-all group"
            >
              <div>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-2 h-2 rounded-full bg-nova-purple animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-nova-purple">Active Signal</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">{survey.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-8">{survey.description}</p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                 <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">
                   {survey.questions?.length || 0} Logic Nodes
                 </span>
                 <button className="flex items-center gap-2 text-nova-purple group">
                    <span className="text-[10px] font-black uppercase tracking-widest">Participate</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
