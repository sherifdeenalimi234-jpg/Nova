import React from 'react';
import { createClient } from '@/lib/supabase/server';
import CreatorsContent from '@/components/admin/CreatorsContent';
import { AlertCircle } from 'lucide-react';

export default async function AdminCreatorsPage() {
  try {
    const supabase = await createClient();

    const { data: premiumRequests, error } = await supabase
      .from('premium_requests')
      .select('*, profiles(full_name, avatar_url)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching premium requests:', error);
      throw error;
    }

    return <CreatorsContent initialRequests={premiumRequests || []} />;
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center mb-6">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-tighter">Data Stream Interrupted</h2>
        <p className="text-white/40 text-sm max-w-md mx-auto mb-8 uppercase tracking-widest leading-relaxed">
          The system encountered an error while retrieving creator applications. This may be due to a schema mismatch or connection timeout.
        </p>
        <button
          className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
        >
          Initialize Reconnection
        </button>
      </div>
    );
  }
}
