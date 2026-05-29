"use client";

import React, { useState } from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function LogoutButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-3 px-4 py-4 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all w-full group border border-transparent hover:border-red-500/20"
      >
        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-black uppercase tracking-[0.2em]">System Exit</span>
      </button>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-[2.5rem] p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.1)]"
            >
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} className="text-red-500 animate-pulse" />
              </div>

              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-2">Terminate Session?</h3>
              <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium mb-8">All active intelligence nodes will be synchronized and encrypted.</p>

              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all"
                >
                  Confirm Exit
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
