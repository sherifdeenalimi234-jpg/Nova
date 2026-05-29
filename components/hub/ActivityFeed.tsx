"use client";

import React from "react";
import { motion } from "framer-motion";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ActivityFeed = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      const supabase = createClient();
      const { data } = await supabase
        .from('activity_feed')
        .select(`
          *,
          user:profiles(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setActivities(data);
      }
      setLoading(false);
    }
    fetchActivities();
  }, []);

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 60) return `${diffInMins}M AGO`;
    if (diffInHours < 24) return `${diffInHours}H AGO`;
    return `${diffInDays}D AGO`;
  };

  const getColorByAction = (action: string) => {
    if (action.includes('RESEARCH') || action.includes('PUBLISHED')) return 'bg-nova-cyan';
    if (action.includes('PROJECT') || action.includes('SUBMITTED')) return 'bg-nova-green';
    if (action.includes('SURVEY') || action.includes('UPDATED')) return 'bg-nova-purple';
    return 'bg-nova-orange';
  };

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
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full glass rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 glass rounded-2xl border-white/5">
            <span className="text-[10px] text-white/20 uppercase tracking-widest">No activity detected</span>
          </div>
        ) : (
          activities.map((activity, idx) => {
            const color = getColorByAction(activity.action);
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass p-4 rounded-2xl flex items-center justify-between border-white/[0.03] hover:bg-white/[0.05] transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${color}/10 border border-${color.replace('bg-', 'border-')}/20 flex items-center justify-center relative overflow-hidden`}>
                    <div className={`absolute inset-0 ${color}/5 animate-pulse`} />
                    <div className={`w-1.5 h-1.5 rounded-full ${color.replace('bg-', 'bg-')} shadow-[0_0_8px_currentColor]`} />
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-white tracking-wide">{activity.user?.full_name || "SYSTEM NODE"}</div>
                    <div className="text-[9px] text-white/40 font-medium tracking-tight mt-0.5">{activity.action}</div>
                  </div>
                </div>
                <div className="text-[8px] font-bold uppercase tracking-widest text-white/20 group-hover:text-white/40 transition-colors">
                  {getTimeAgo(activity.created_at)}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <button className="w-full mt-6 py-4 border border-white/5 rounded-2xl text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 hover:text-white/60 hover:bg-white/[0.02] transition-all">
        ACCESS COMPLETE LOGS
      </button>
    </section>
  );
};

export default ActivityFeed;
