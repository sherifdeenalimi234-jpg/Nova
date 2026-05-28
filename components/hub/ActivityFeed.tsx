"use client";

import React from "react";

const activities = [
  { id: 1, user: "Nova AI", action: "generated new research signal", time: "2m ago", type: "system" },
  { id: 2, user: "Alex Rivera", action: "submitted Project Phoenix", time: "15m ago", type: "project" },
  { id: 3, user: "Global Hub", action: "updated survey parameters", time: "1h ago", type: "survey" },
  { id: 4, user: "Elena Vance", action: "published findings on Q-Link", time: "3h ago", type: "research" },
];

const ActivityFeed = () => {
  return (
    <section className="px-6 py-4 mb-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 ml-1">Live Activity</h3>
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-nova-green animate-pulse" />
          <span className="text-[8px] uppercase tracking-tighter text-nova-green">Live</span>
        </div>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="glass p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                 <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
              </div>
              <div>
                <div className="text-xs font-bold text-white/90">{activity.user}</div>
                <div className="text-[10px] text-white/50">{activity.action}</div>
              </div>
            </div>
            <div className="text-[8px] uppercase text-white/30">{activity.time}</div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-3 border border-white/5 rounded-xl text-[10px] uppercase tracking-[0.2em] text-white/30 hover:bg-white/5 transition-colors">
        View All Activity
      </button>
    </section>
  );
};

export default ActivityFeed;
