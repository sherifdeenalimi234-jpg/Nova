"use client";

import React from "react";
import { motion } from "framer-motion";

const activities = [
  { id: 1, user: "SYSTEM NODE", action: "NEW RESEARCH SIGNAL GENERATED", time: "2M AGO", color: "bg-nova-cyan" },
  { id: 2, user: "ALEX RIVERA", action: "PROJECT PHOENIX SUBMITTED", time: "15M AGO", color: "bg-nova-green" },
  { id: 3, user: "GLOBAL HUB", action: "SURVEY PARAMETERS UPDATED", time: "1H AGO", color: "bg-nova-purple" },
  { id: 4, user: "ELENA VANCE", action: "RESEARCH FINDINGS PUBLISHED", time: "3H AGO", color: "bg-nova-cyan" },
];

const ActivityFeed = () => {
  return (
    <section className="px-6 py-4 mb-20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">LIVE ACTIVITY FEED</h3>
        <div className="flex items-center gap-2 bg-nova-green/10 px-2 py-1 rounded-full border border-nova-green/20">
          <div className="w-1 h-1 rounded-full bg-nova-green animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-tighter text-nova-green">STREAMING</span>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity, idx) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-4 rounded-2xl flex items-center justify-between border-white/[0.03] hover:bg-white/[0.05] transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${activity.color}/10 border border-${activity.color}/20 flex items-center justify-center relative overflow-hidden`}>
                 <div className={`absolute inset-0 ${activity.color}/5 animate-pulse`} />
                 <div className={`w-1.5 h-1.5 rounded-full ${activity.color} shadow-[0_0_8px_currentColor]`} />
              </div>
              <div>
                <div className="text-[11px] font-black text-white tracking-wide">{activity.user}</div>
                <div className="text-[9px] text-white/40 font-medium tracking-tight mt-0.5">{activity.action}</div>
              </div>
            </div>
            <div className="text-[8px] font-bold uppercase tracking-widest text-white/20 group-hover:text-white/40 transition-colors">{activity.time}</div>
          </motion.div>
        ))}
      </div>

      <button className="w-full mt-6 py-4 border border-white/5 rounded-2xl text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 hover:text-white/60 hover:bg-white/[0.02] transition-all">
        ACCESS COMPLETE LOGS
      </button>
    </section>
  );
};

export default ActivityFeed;
