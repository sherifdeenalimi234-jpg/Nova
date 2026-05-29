import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PremiumVerification from '@/components/admin/PremiumVerification';
import * as motion from "framer-motion/client";

export default async function AdminCreatorsPage() {
  const supabase = await createClient();

  const { data: premiumRequests } = await supabase
    .from('premium_requests')
    .select('*, profiles(full_name, avatar_url)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            Creator <span className="text-nova-purple">Protocols</span>
          </h1>
          <p className="text-white/40 mt-2 tracking-[0.2em] uppercase text-[10px]">
            Intelligence Verification & Access Control
          </p>
        </div>
      </div>

      <div className="p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl min-h-[600px]">
        <PremiumVerification initialRequests={premiumRequests || []} />
      </div>
    </motion.div>
  );
}
