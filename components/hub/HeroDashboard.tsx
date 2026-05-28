"use client";

import React from "react";
import { Activity, Users, Lightbulb, BarChart3 } from "lucide-react";

const HeroDashboard = () => {
  return (
    <section className="pt-24 pb-8 px-6">
      <div className="mb-6">
        <h2 className="text-nova-cyan text-[10px] uppercase tracking-[0.3em] mb-1">System Status: Active</h2>
        <h1 className="text-3xl font-bold">Welcome, Innovator</h1>
        <p className="text-white/50 text-sm mt-1">Ecosystem initialization complete. Awaiting command.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <Users size={14} />
            <span className="text-[10px] uppercase tracking-wider">Community</span>
          </div>
          <div className="text-xl font-bold">12.4k</div>
          <div className="text-[8px] text-nova-green mt-1 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-nova-green" />
            +12% this week
          </div>
        </div>

        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <Lightbulb size={14} />
            <span className="text-[10px] uppercase tracking-wider">Projects</span>
          </div>
          <div className="text-xl font-bold">842</div>
          <div className="text-[8px] text-nova-cyan mt-1 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-nova-cyan" />
            24 in active phase
          </div>
        </div>

        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <BarChart3 size={14} />
            <span className="text-[10px] uppercase tracking-wider">Surveys</span>
          </div>
          <div className="text-xl font-bold">156</div>
          <div className="text-[8px] text-nova-purple mt-1 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-nova-purple" />
            5 new today
          </div>
        </div>

        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <Activity size={14} />
            <span className="text-[10px] uppercase tracking-wider">Analytics</span>
          </div>
          <div className="text-xl font-bold">98.2%</div>
          <div className="text-[8px] text-white/30 mt-1">System Efficiency</div>
        </div>
      </div>
    </section>
  );
};

export default HeroDashboard;
