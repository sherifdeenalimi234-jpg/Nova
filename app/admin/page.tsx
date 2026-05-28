import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ContentModeration from '@/components/admin/ContentModeration';
import PremiumVerification from '@/components/admin/PremiumVerification';
import UserManagement from '@/components/admin/UserManagement';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch Pending Content
  const { data: pendingPosts } = await supabase
    .from('posts')
    .select('*, author:profiles(full_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  const { data: premiumRequests } = await supabase
    .from('premium_requests')
    .select('*, profiles(full_name, avatar_url)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  const { data: allUsers } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch Stats
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: premiumUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified_creator', true);

  const { count: activeSurveys } = await supabase
    .from('surveys')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open');

  const { count: pendingPostsCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const stats = [
    { label: 'Total Users', value: totalUsers || 0 },
    { label: 'Verified Creators', value: premiumUsers || 0 },
    { label: 'Active Surveys', value: activeSurveys || 0 },
    { label: 'Pending Posts', value: pendingPostsCount || 0 },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-[0.2em] text-nova-cyan uppercase">
            Mission Control
          </h1>
          <p className="text-white/40 mt-2 tracking-widest uppercase text-[10px] md:text-xs">
            Ecosystem Operating System v1.0
          </p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="p-4 md:p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
              <div className="text-white/40 text-[8px] md:text-[10px] uppercase tracking-widest mb-2 font-bold">
                {stat.label}
              </div>
              <div className="text-2xl md:text-3xl font-black text-nova-cyan">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <ContentModeration initialPosts={pendingPosts || []} />
           </div>

           <div className="p-6 md:p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <PremiumVerification initialRequests={premiumRequests || []} />
           </div>
        </div>

        <div className="mt-10 p-6 md:p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
           <UserManagement initialUsers={allUsers || []} />
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 opacity-50">
           <div className="p-6 md:p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <h2 className="text-sm font-bold tracking-widest uppercase mb-6 text-nova-cyan/80">Ecosystem Growth (Phase 6)</h2>
              <div className="h-40 flex items-center justify-center border border-dashed border-white/5 rounded-2xl">
                 <p className="text-white/20 text-[10px] uppercase tracking-widest">Analytics Module Loading...</p>
              </div>
           </div>

           <div className="p-6 md:p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <h2 className="text-sm font-bold tracking-widest uppercase mb-6 text-nova-purple/80">System Alerts</h2>
              <div className="space-y-4">
                 <div className="p-4 rounded-xl bg-nova-cyan/5 border border-nova-cyan/10">
                    <p className="text-[10px] text-nova-cyan font-bold uppercase tracking-widest mb-1">Status Report</p>
                    <p className="text-white/60 text-xs text-pretty leading-relaxed">System architecture verified. Foundation Phase 1 complete. Core moderation modules initialized.</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="mt-10 p-10 rounded-3xl border border-dashed border-white/10 flex items-center justify-center">
          <div className="text-center">
             <div className="text-nova-cyan/20 text-6xl mb-4">
                <span className="animate-pulse">◌</span>
             </div>
             <h2 className="text-xl font-bold tracking-widest uppercase mb-2">Advanced Modules Offline</h2>
             <p className="text-white/30 text-sm">Moderation and Verification systems initializing in next phase...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
