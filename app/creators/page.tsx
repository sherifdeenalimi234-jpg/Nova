"use client";
export const dynamic = "force-dynamic";



import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CreatorDirectory() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCreators() {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_verified_creator', true)
        .order('full_name', { ascending: true });

      if (data) setCreators(data);
      setLoading(false);
    }
    fetchCreators();
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
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Network</h1>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Verified Innovation Nodes</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {creators.map((creator) => (
          <Link href={`/u/${creator.custom_url || creator.id}`} key={creator.id}>
            <motion.div
              whileHover={{ y: -5 }}
              className="glass p-6 rounded-[2.5rem] border-white/5 flex flex-col items-center text-center group"
            >
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-nova-cyan/20 to-nova-purple/20 border border-white/10 overflow-hidden">
                   {creator.avatar_url ? (
                     <img src={creator.avatar_url} className="w-full h-full object-cover" alt="" />
                   ) : (
                     <Users size={40} className="mt-6 text-white/10" />
                   )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center text-nova-cyan shadow-xl">
                   <ShieldCheck size={16} />
                </div>
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-1">{creator.full_name}</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-6">Verified Creator</p>

              <div className="w-full pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-nova-cyan opacity-0 group-hover:opacity-100 transition-all">
                <span className="text-[9px] font-black uppercase tracking-widest">Access Node</span>
                <ArrowRight size={12} />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
