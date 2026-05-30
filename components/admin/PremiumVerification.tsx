"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  XCircle,
  User,
  Loader2,
  Search,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  RefreshCcw,
  Eye,
  CheckCircle2,
  Calendar,
  Maximize2
} from 'lucide-react';
import { moderatePremiumRequest } from '@/lib/actions/admin';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface PremiumRequest {
  id: string;
  user_id: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
    email?: string;
  };
  payment_reference: string;
  created_at: string;
  verification_doc_url?: string;
  proof_url?: string;
  payment_note?: string;
  category?: string;
  status: string;
  approval_status: string;
  verification_status: string;
  reviewed_at?: string;
  reviewed_by?: string;
  approved_at?: string;
}

export default function PremiumVerification({ initialRequests = [] }: { initialRequests?: PremiumRequest[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    let note = "";
    if (status === 'rejected') {
      const input = prompt("Please enter a reason for rejection (optional):");
      if (input === null) return; // Cancelled
      note = input;
    }

    setProcessingId(id);
    const { error } = await moderatePremiumRequest(id, status, note);
    if (!error) {
      setRequests(requests.map(r => r.id === id ? {
        ...r,
        status,
        approval_status: status,
        verification_status: status
      } : r));
      router.refresh();
    } else {
      alert("Action failed: " + (error as any).message);
    }
    setProcessingId(null);
  };

  const filteredRequests = requests.filter(r => {
    const search = searchTerm.toLowerCase();
    const name = r.profiles?.full_name?.toLowerCase() || '';
    const email = r.profiles?.email?.toLowerCase() || '';
    const ref = r.payment_reference?.toLowerCase() || '';
    const userId = r.user_id?.toLowerCase() || '';

    return name.includes(search) ||
           email.includes(search) ||
           ref.includes(search) ||
           userId.includes(search);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold uppercase text-white">Creator Intake</h3>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Live Queue Analysis</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-nova-purple/10 border border-nova-purple/20 text-[10px] font-black text-nova-purple uppercase">
          {filteredRequests.length} TOTAL RECORDS
        </span>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          type="text"
          placeholder="Search name, email or reference..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-[10px] uppercase text-white outline-none focus:border-nova-purple/50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredRequests.map((req) => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={req.id}
            className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col gap-6 hover:bg-white/[0.04] transition-all group"
          >
            {/* Header: Profile Info */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-nova-purple/10 flex items-center justify-center border border-nova-purple/20 overflow-hidden shrink-0">
                  {req.profiles?.avatar_url ? (
                    <img src={req.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-nova-purple/40" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-black text-white truncate tracking-tight">
                    {req.profiles?.full_name || req.profiles?.email || 'Unknown User'}
                  </h4>
                  {req.profiles?.full_name && req.profiles?.email && (
                    <p className="text-[10px] text-white/40 truncate font-medium uppercase tracking-widest">
                      {req.profiles.email}
                    </p>
                  )}
                </div>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                req.status === 'approved' ? "bg-nova-green/10 text-nova-green border-nova-green/20" :
                req.status === 'rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-white/5 text-white/40 border-white/10"
              )}>
                {req.status || 'PENDING'}
              </div>
            </div>

            {/* Submission Meta */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-nova-cyan mb-1">Submitted</p>
                <div className="flex items-center gap-2 text-white/60">
                   <Calendar size={12} />
                   <span className="text-[10px] font-bold uppercase tracking-widest">
                      {new Date(req.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                   </span>
                </div>
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-nova-cyan mb-1">Payment Ref</p>
                <p className="text-[10px] font-mono font-bold text-white truncate">{req.payment_reference}</p>
              </div>
            </div>

            {req.payment_note && (
               <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Note</p>
                  <p className="text-[10px] text-white/60 italic leading-relaxed">"{req.payment_note}"</p>
               </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={!req.proof_url && !req.verification_doc_url}
                onClick={() => {
                   const url = req.proof_url || req.verification_doc_url;
                   if (url) {
                      if (url.toLowerCase().includes('.pdf')) {
                         window.open(url, '_blank');
                      } else {
                         setPreviewUrl(url);
                      }
                   }
                }}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Maximize2 size={14} /> {(!req.proof_url && !req.verification_doc_url) ? "No proof uploaded." : "Preview Proof"}
              </button>
              <Link
                href={`/u/${req.user_id}`}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                <User size={14} /> View Profile
              </Link>

              {(!req.status || req.status === 'pending') && (
                processingId === req.id ? (
                  <div className="col-span-2 flex justify-center py-2"><Loader2 size={24} className="animate-spin text-nova-purple" /></div>
                ) : (
                  <>
                    <button
                      onClick={() => handleAction(req.id, 'approved')}
                      className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-nova-cyan text-black text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,255,0.3)] transition-all"
                    >
                      <ShieldCheck size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'rejected')}
                      className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500/20 transition-all"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </>
                )
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Proof Preview Modal */}
      <AnimatePresence>
        {previewUrl && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewUrl(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full h-full bg-[#0a0a0b] rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest">Verification Proof Preview</h3>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <XCircle size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/50">
                <img
                  src={previewUrl}
                  alt="Proof"
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-xl"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
