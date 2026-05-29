"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bell, Loader2, CheckCircle2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) setNotifications(data);
      }
      setLoading(false);
    }
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    const supabase = createClient();
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

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
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Intelligence</h1>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">System alerts and updates</p>
      </header>

      {notifications.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border-white/5">
           <Bell className="mx-auto mb-4 text-white/10" size={48} />
           <p className="text-white/20 uppercase tracking-widest text-sm">Clear frequency. No new signals.</p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markAsRead(n.id)}
              className={`glass p-6 rounded-2xl border-white/5 flex items-start gap-4 transition-all cursor-pointer ${!n.is_read ? 'bg-nova-cyan/5 border-nova-cyan/20' : 'opacity-60'}`}
            >
              <div className={`p-2 rounded-xl ${n.type === 'alert' ? 'bg-red-500/10 text-red-500' : 'bg-nova-cyan/10 text-nova-cyan'}`}>
                {n.type === 'alert' ? <Zap size={18} /> : <CheckCircle2 size={18} />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-bold uppercase tracking-wide">{n.title}</h3>
                  <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
