"use client";

import React, { useState } from 'react';
import {
  ShieldCheck,
  XCircle,
  User,
  Loader2,
  Search,
  ExternalLink,
  FileText,
  AlertCircle
} from 'lucide-react';
import { moderatePremiumRequest } from '@/lib/actions/admin';
import { cn } from '@/lib/utils';

interface PremiumRequest {
  id: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
  payment_reference: string;
  created_at: string;
  verification_doc_url?: string;
}

export default function PremiumVerification({ initialRequests = [] }: { initialRequests?: PremiumRequest[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    const { error } = await moderatePremiumRequest(id, status);
    if (!error) {
      setRequests(requests.filter(r => r.id !== id));
    } else {
      alert("Verification sequence failed: " + (error as any).message);
    }
    setProcessingId(null);
  };

  const filteredRequests = requests.filter(r =>
    r.profiles.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-widest uppercase text-white leading-none">Creator Intake</h3>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">Awaiting authentication</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-nova-purple/10 border border-nova-purple/20 text-[10px] font-bold text-nova-purple">
          {requests.length} PENDING
        </span>
      </div>

      <div className="relative group">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-nova-purple transition-colors" />
        <input
          type="text"
          placeholder="Filter applications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] uppercase tracking-widest text-white placeholder:text-white/20 outline-none focus:border-nova-purple/50 transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {filteredRequests.length === 0 ? (
          <div className="h-40 rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center text-white/10 gap-2">
            <ShieldCheck size={24} />
            <span className="text-[10px] uppercase tracking-[0.2em]">Queue Neutralized</span>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div key={req.id} className="p-4 rounded-2xl bg-white/2 border border-white/5 hover:border-white/10 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-nova-purple/10 flex items-center justify-center border border-nova-purple/20 overflow-hidden relative">
                   {req.profiles.avatar_url ? (
                     <img src={req.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                   ) : (
                     <User size={18} className="text-nova-purple/60" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                   <h4 className="text-xs font-bold text-white truncate">{req.profiles.full_name}</h4>
                   <p className="text-[9px] text-white/30 uppercase tracking-tighter truncate">Ref: {req.payment_reference}</p>
                </div>
                <button
                  onClick={() => setSelectedDoc(req.verification_doc_url || '#')}
                  className="p-2 rounded-lg bg-white/5 text-white/20 hover:text-nova-cyan hover:bg-nova-cyan/10 transition-all"
                  title="View Credentials"
                >
                  <FileText size={14} />
                </button>
              </div>

              <div className="flex gap-2">
                 {processingId === req.id ? (
                   <div className="flex-1 flex items-center justify-center py-2.5">
                      <Loader2 size={16} className="animate-spin text-nova-purple" />
                   </div>
                 ) : (
                   <>
                    <button
                      onClick={() => handleAction(req.id, 'approved')}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-nova-purple/10 text-nova-purple text-[9px] font-black uppercase tracking-[0.2em] hover:bg-nova-purple/20 transition-all border border-nova-purple/20"
                    >
                        Authorize
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'rejected')}
                      className="px-4 flex items-center justify-center rounded-xl bg-white/5 text-white/20 hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5"
                    >
                        <XCircle size={14} />
                    </button>
                   </>
                 )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Doc Preview Modal (Simplified for UI Demo) */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-20 bg-black/90 backdrop-blur-md">
           <div className="relative w-full max-w-4xl h-full bg-neutral-900 rounded-3xl border border-white/10 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                 <h3 className="text-xs font-black uppercase tracking-widest text-white">Verification Credential</h3>
                 <button onClick={() => setSelectedDoc(null)} className="text-white/40 hover:text-white uppercase text-[10px] font-bold">Close Terminal</button>
              </div>
              <div className="flex-1 bg-black/50 flex items-center justify-center p-10">
                 <div className="text-center">
                    <AlertCircle size={40} className="text-nova-cyan mx-auto mb-4 opacity-20" />
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/20">Secure Document Viewer Engaged</p>
                    <p className="text-xs text-white/40 mt-4 max-w-xs mx-auto italic">Verification document would render here in a secure sandboxed environment.</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
