"use client";

import React from "react";
import { Activity, Users, Lightbulb, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const HeroDashboard = () => {
  return (
    <section className="pt-28 pb-8 px-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-nova-green animate-pulse" />
          <h2 className="text-nova-cyan text-[9px] font-bold uppercase tracking-[0.4em]">Node Status: Online</h2>
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-2">DASHBOARD</h1>
        <p className="text-white/40 text-xs tracking-widest uppercase">Global Innovation Control Center</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-5 rounded-2xl border-white/5 bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 text-white/30 mb-3">
            <Users size={14} className="text-nova-cyan" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Users</span>
          </div>
          <div className="text-2xl font-black tracking-tighter">12.4K</div>
          <div className="text-[8px] text-nova-green font-bold mt-2 uppercase tracking-tighter flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-nova-green" />
            Active Nodes
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-5 rounded-2xl border-white/5 bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 text-white/30 mb-3">
            <Lightbulb size={14} className="text-nova-purple" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Projects</span>
          </div>
          <div className="text-2xl font-black tracking-tighter">842</div>
          <div className="text-[8px] text-nova-cyan font-bold mt-2 uppercase tracking-tighter flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-nova-cyan" />
            Incubating
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-5 rounded-2xl border-white/5 bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 text-white/30 mb-3">
            <BarChart3 size={14} className="text-nova-cyan" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Surveys</span>
          </div>
          <div className="text-2xl font-black tracking-tighter">156</div>
          <div className="text-[8px] text-nova-purple font-bold mt-2 uppercase tracking-tighter flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-nova-purple" />
            Live Signals
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-5 rounded-2xl border-white/5 bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 text-white/30 mb-3">
            <Activity size={14} className="text-nova-green" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Health</span>
          </div>
          <div className="text-2xl font-black tracking-tighter">98.2%</div>
          <div className="text-[8px] text-white/20 font-bold mt-2 uppercase tracking-tighter flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-white/20" />
            System Load
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroDashboard;
