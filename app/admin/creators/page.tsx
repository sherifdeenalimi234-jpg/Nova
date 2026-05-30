import React from 'react';
import { createClient } from '@/lib/supabase/server';
import CreatorsContent from '@/components/admin/CreatorsContent';

export default async function AdminCreatorsPage() {
  const supabase = await createClient();

  // 1. Locate the exact query used to load requests & 2. Print exact query intent
  // 5. Verify the query is reading from premium_requests
  // 6. Temporarily remove ALL filters & 7. Load every row from premium_requests
  const { data, error } = await supabase
    .from('premium_requests')
    .select('*')
    .order('created_at', { ascending: false });

  // 3. Add logging before rendering
  console.log("REQUEST DATA", data);
  console.log("REQUEST ERROR", error);
  console.log("REQUEST COUNT", data?.length);

  // 10. Test this exact query: SELECT * FROM premium_requests ORDER BY created_at DESC;
  // This is what the above supabase query does.

  // 9. Inspect joins with profiles (Separate check)
  const { data: joinedData, error: joinedError } = await supabase
    .from('premium_requests')
    .select('*, profiles(full_name, avatar_url, email)')
    .order('created_at', { ascending: false });

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="p-4 md:p-8 bg-[#0a0a0b] min-h-screen text-white font-sans">
      {/* 8. Display raw results on screen (DEBUG CONSOLE) */}
      <div className="mb-10 p-6 bg-zinc-900/50 border-2 border-nova-cyan/50 rounded-[2rem] backdrop-blur-xl shadow-[0_0_50px_rgba(0,242,255,0.1)] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-nova-cyan">Live Debug Console</h2>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500 animate-pulse' : 'bg-nova-green shadow-[0_0_10px_#00f255]'}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{error ? 'Query Malfunction' : 'Database Link Optimal'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
            <p className="text-[9px] text-white/20 uppercase font-black mb-1 tracking-widest">Active Admin Node</p>
            <p className="text-xs truncate font-mono text-nova-cyan/80">{user?.email || 'UNAUTHORIZED'}</p>
          </div>
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
            <p className="text-[9px] text-white/20 uppercase font-black mb-1 tracking-widest">Raw Rows Found</p>
            <p className="text-3xl font-black">{data?.length || 0}</p>
          </div>
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
            <p className="text-[9px] text-white/20 uppercase font-black mb-1 tracking-widest">Join Success Rate</p>
            <p className="text-3xl font-black">{joinedData?.length || 0}</p>
          </div>
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
            <p className="text-[9px] text-white/20 uppercase font-black mb-1 tracking-widest">Error Status</p>
            <p className={`text-xs font-bold uppercase ${error ? 'text-red-500' : 'text-nova-green'}`}>{error ? error.code : 'NONE'}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-[10px] font-black text-red-500 uppercase mb-1">Diagnostic Error:</p>
            <p className="text-xs text-red-400/80 font-mono">{error.message}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/20">
            <span>Raw Database Stream (premium_requests)</span>
            <span>UTF-8 • Encrypted</span>
          </div>
          <div className="max-h-60 overflow-auto bg-black/60 p-4 rounded-2xl border border-white/5 custom-scrollbar">
            <pre className="text-[9px] leading-relaxed text-white/40 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>
      </div>

      <CreatorsContent initialRequests={joinedData || []} />
    </div>
  );
}
