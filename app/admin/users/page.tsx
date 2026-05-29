import React from 'react';
import { createClient } from '@/lib/supabase/server';
import UserManagement from '@/components/admin/UserManagement';
import { motion } from "framer-motion";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: allUsers } = await supabase
    .from('profiles')
    .select('*')
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
            Intelligence <span className="text-nova-green">Directory</span>
          </h1>
          <p className="text-white/40 mt-2 tracking-[0.2em] uppercase text-[10px]">
            Ecosystem Node Management & Synchronization
          </p>
        </div>
      </div>

      <div className="p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
        <UserManagement initialUsers={allUsers || []} />
      </div>
    </motion.div>
  );
}
