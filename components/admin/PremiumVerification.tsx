"use client";

import React, { useState } from 'react';
import { ShieldCheck, XCircle, User, Loader2 } from 'lucide-react';
import { moderatePremiumRequest } from '@/lib/actions/admin';

interface PremiumRequest {
  id: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
  payment_reference: string;
  created_at: string;
}

export default function PremiumVerification({ initialRequests = [] }: { initialRequests?: PremiumRequest[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    const { error } = await moderatePremiumRequest(id, status);
    if (!error) {
      setRequests(requests.filter(r => r.id !== id));
    } else {
      alert("Verification sequence failed: " + error.message);
    }
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-widest uppercase text-white">Creator Applications</h3>
        <span className="px-3 py-1 rounded-full bg-nova-purple/10 border border-nova-purple/20 text-[10px] font-bold text-nova-purple">
          {requests.length} PENDING
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-white/5 bg-white/2 flex items-center justify-center text-white/20 text-xs uppercase tracking-widest">
          No Applications
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <div key={req.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-nova-purple/30 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-nova-purple/20 flex items-center justify-center border border-nova-purple/30 overflow-hidden">
                   {req.profiles.avatar_url ? (
                     <img src={req.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                   ) : (
                     <User size={20} className="text-nova-purple" />
                   )}
                </div>
                <div>
                   <h4 className="text-sm font-bold text-white">{req.profiles.full_name}</h4>
                   <p className="text-[10px] text-white/40 uppercase tracking-widest">Ref: {req.payment_reference}</p>
                </div>
              </div>

              <div className="flex gap-2">
                 {processingId === req.id ? (
                   <div className="flex-1 flex items-center justify-center py-2">
                      <Loader2 size={16} className="animate-spin text-nova-purple" />
                   </div>
                 ) : (
                   <>
                    <button
                      onClick={() => handleAction(req.id, 'approved')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-nova-purple/20 text-nova-purple text-[10px] font-black uppercase tracking-widest hover:bg-nova-purple/30 transition-all"
                    >
                        <ShieldCheck size={14} /> Approve Access
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'rejected')}
                      className="px-4 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:bg-red-500/10 hover:text-red-500 transition-all"
                    >
                        <XCircle size={14} />
                    </button>
                   </>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
