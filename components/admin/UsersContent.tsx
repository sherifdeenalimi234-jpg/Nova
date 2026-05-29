"use client";

import React from 'react';
import UserManagement from '@/components/admin/UserManagement';
import { motion } from "framer-motion";

interface UsersContentProps {
  initialUsers: any[];
}

export default function UsersContent({ initialUsers }: UsersContentProps) {
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
        <UserManagement initialUsers={initialUsers} />
      </div>
    </motion.div>
  );
}
