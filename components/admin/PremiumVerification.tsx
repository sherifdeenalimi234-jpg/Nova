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
  CheckCircle2
} from 'lucide-react';
import { moderatePremiumRequest } from '@/lib/actions/admin';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
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
  const router = useRouter();

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    const { error } = await moderatePremiumRequest(id, status);
    if (!error) {
      setRequests(requests.map(r => r.id === id ? { ...r, status, approval_status: status } : r));
      router.refresh();
    } else {
      alert("Action failed: " + (error as any).message);
    }
    setProcessingId(null);
  };

  const filteredRequests = requests.filter(r =>
    r.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredRequests.map((req) => (
          <div key={req.id} className="p-5 rounded-3xl bg-white/2 border border-white/5 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-nova-purple/10 flex items-center justify-center border border-nova-purple/20 overflow-hidden">
                {req.profiles?.avatar_url ? (
                  <img src={req.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={18} className="text-nova-purple/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-white truncate">{req.profiles?.full_name || 'ANONYMOUS'}</h4>
                <p className="text-[10px] text-white/40 truncate">{req.profiles?.email || 'NO EMAIL'}</p>
              </div>
              <div className={cn(
                "px-2 py-1 rounded-md text-[8px] font-black uppercase",
                req.status === 'approved' ? "bg-nova-green/20 text-nova-green" :
                req.status === 'rejected' ? "bg-red-500/20 text-red-500" : "bg-white/10 text-white/40"
              )}>
                {req.status || 'PENDING'}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-nova-cyan font-mono font-bold">REF: {req.payment_reference}</p>
              {req.payment_note && <p className="text-[10px] text-white/60 italic leading-relaxed mt-1">"{req.payment_note}"</p>}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <a
                href={req.proof_url || req.verification_doc_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[9px] font-black uppercase hover:bg-white/10 transition-all"
              >
                <FileText size={12} /> View Proof
              </a>
              <Link
                href={`/u/${req.user_id}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[9px] font-black uppercase hover:bg-white/10 transition-all"
              >
                <Eye size={12} /> View Profile
              </Link>

              {(!req.status || req.status === 'pending') && (
                processingId === req.id ? (
                  <div className="col-span-2 flex justify-center py-2"><Loader2 size={20} className="animate-spin text-nova-purple" /></div>
                ) : (
                  <>
                    <button
                      onClick={() => handleAction(req.id, 'approved')}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-nova-cyan/10 text-nova-cyan text-[9px] font-black uppercase border border-nova-cyan/20 hover:bg-nova-cyan/20"
                    >
                      <ShieldCheck size={12} /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'rejected')}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 text-[9px] font-black uppercase border border-red-500/20 hover:bg-red-500/20"
                    >
                      <XCircle size={12} /> Reject
                    </button>
                  </>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
