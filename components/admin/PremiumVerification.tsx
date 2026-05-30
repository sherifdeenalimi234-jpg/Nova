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
  Clock,
  Filter
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
  admin_note?: string;
}

type TabType = 'pending' | 'approved' | 'rejected';

export default function PremiumVerification({ initialRequests = [] }: { initialRequests?: PremiumRequest[] }) {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [requests, setRequests] = useState(initialRequests);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    console.log(`[Admin] Initiating ${status} sequence for request: ${id}`);
    const { error } = await moderatePremiumRequest(id, status);
    if (!error) {
      setRequests(requests.map(r => r.id === id ? { ...r, status, approval_status: status } : r));
      router.refresh();
    } else {
      console.error(`[Admin] Moderation failed for ${id}:`, error);
      alert("Verification sequence failed: " + (error as any).message);
    }
    setProcessingId(null);
  };

  const filteredRequests = requests.filter(r => {
    const matchesTab = r.status === activeTab || (activeTab === 'pending' && (!r.status || r.status === 'pending'));
    const matchesSearch =
      r.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const counts = {
    pending: requests.filter(r => !r.status || r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black tracking-widest uppercase text-white leading-none">Creator Intake</h3>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2 font-medium">Neural verification system active</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
          {(['pending', 'approved', 'rejected'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2",
                activeTab === tab
                  ? "bg-nova-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  : "text-white/40 hover:text-white/60"
              )}
            >
              {tab === 'pending' && <Clock size={12} />}
              {tab === 'approved' && <CheckCircle2 size={12} />}
              {tab === 'rejected' && <XCircle size={12} />}
              {tab}
              <span className={cn(
                "ml-1 px-1.5 py-0.5 rounded-md text-[8px]",
                activeTab === tab ? "bg-white/20 text-white" : "bg-white/5 text-white/20"
              )}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-nova-purple transition-colors" />
        <input
          type="text"
          placeholder="Filter applications by name, email or reference..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/2 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[10px] uppercase tracking-widest text-white placeholder:text-white/20 outline-none focus:border-nova-purple/50 transition-all shadow-inner"
        />
      </div>

      {/* Request Feed - Mobile First Stacked Cards */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar min-h-[400px] pb-10">
        {filteredRequests.length === 0 ? (
          <div className="h-60 rounded-[2.5rem] border border-dashed border-white/5 flex flex-col items-center justify-center text-white/10 gap-4 bg-white/[0.01]">
            <div className="p-5 rounded-full bg-white/2 border border-white/5">
              <ShieldCheck size={40} className="opacity-10" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.4em] font-black opacity-40">Queue Synchronized</span>
          </div>
        ) : (
          filteredRequests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-[2.5rem] bg-white/2 border border-white/5 hover:border-nova-purple/30 transition-all group relative overflow-hidden flex flex-col gap-6"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-nova-purple/5 blur-[50px] pointer-events-none" />

              {/* Card Header: User Info */}
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-nova-purple/10 flex items-center justify-center border border-nova-purple/20 overflow-hidden shrink-0 shadow-lg">
                   {req.profiles?.avatar_url ? (
                     <img src={req.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                   ) : (
                     <User size={24} className="text-nova-purple/40" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h4 className="text-base font-black text-white truncate max-w-[150px]">{req.profiles?.full_name || 'Anonymous User'}</h4>
                      <span className="px-2 py-0.5 rounded-lg bg-nova-purple/20 text-nova-purple text-[8px] font-black uppercase tracking-tighter border border-nova-purple/20">
                         {req.category || 'INNOVATOR'}
                      </span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium truncate">{req.profiles?.email || 'No email associated'}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-nova-cyan uppercase tracking-widest font-mono font-bold">REF: {req.payment_reference}</p>
                        <span className="text-white/10 text-[10px]">•</span>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest font-medium">
                          {new Date(req.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                   </div>
                </div>

                <Link
                  href={`/u/${req.user_id}`}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-nova-cyan hover:border-nova-cyan/30 hover:bg-nova-cyan/5 transition-all"
                >
                  <Eye size={18} />
                </Link>
              </div>

              {/* Card Content: Note */}
              {req.payment_note && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 relative z-10">
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-2">Internal Transmission</p>
                  <p className="text-xs text-white/70 leading-relaxed italic line-clamp-3">"{req.payment_note}"</p>
                </div>
              )}

              {/* Card Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10 mt-auto">
                 <button
                   onClick={() => {
                     const proofUrl = req.proof_url || req.verification_doc_url;
                     console.log("[Admin] Proof URL detected:", proofUrl);
                     setSelectedDoc(proofUrl || '#');
                   }}
                   className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:text-nova-cyan hover:border-nova-cyan/20 transition-all group/btn sm:col-span-2"
                 >
                    <div className="flex items-center gap-3">
                       <FileText size={16} className="text-nova-cyan group-hover/btn:scale-110 transition-transform" />
                       View Intelligence Proof
                    </div>
                    <ChevronRight size={16} />
                 </button>

                 {activeTab === 'pending' && (
                   processingId === req.id ? (
                     <div className="sm:col-span-2 flex items-center justify-center py-4">
                        <Loader2 size={24} className="animate-spin text-nova-purple" />
                     </div>
                   ) : (
                     <>
                      <button
                        onClick={() => handleAction(req.id, 'approved')}
                        className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-nova-cyan/10 text-nova-cyan text-[10px] font-black uppercase tracking-widest hover:bg-nova-cyan/20 transition-all border border-nova-cyan/20 shadow-[0_0_20px_rgba(0,242,255,0.05)] active:scale-95"
                      >
                          <ShieldCheck size={16} /> Authorize Access
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'rejected')}
                        className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5 active:scale-95"
                      >
                          <XCircle size={16} /> Deny Protocols
                      </button>
                     </>
                   )
                 )}

                 {activeTab !== 'pending' && (
                    <div className={cn(
                      "sm:col-span-2 py-3 rounded-2xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest",
                      activeTab === 'approved' ? "bg-nova-green/10 border-nova-green/20 text-nova-green" : "bg-red-500/10 border-red-500/20 text-red-500"
                    )}>
                      {activeTab === 'approved' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      Resolution: {activeTab}
                    </div>
                 )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Doc Preview Modal - Mobile Optimized */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-2xl"
          >
             <motion.div
               initial={{ scale: 0.95, y: 30 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.95, y: 30 }}
               className="relative w-full max-w-4xl h-[85vh] md:h-full bg-neutral-900 rounded-[3rem] border border-white/10 overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)]"
             >
                <div className="p-6 md:p-10 border-b border-white/5 flex items-center justify-between bg-black/20">
                   <div>
                      <h3 className="text-sm md:text-base font-black uppercase tracking-[0.3em] text-white">Intelligence Credential</h3>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1.5 font-medium">Verification Stream: 7.2.4 • Node Encrypted</p>
                   </div>
                   <button
                     onClick={() => setSelectedDoc(null)}
                     className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                   >
                      <XCircle size={24} />
                   </button>
                </div>
                <div className="flex-1 bg-black/60 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-y-auto custom-scrollbar">
                   {/* Background Glow */}
                   <div className="absolute inset-0 bg-nova-cyan/2 blur-[100px] pointer-events-none" />

                   {selectedDoc && selectedDoc !== '#' ? (
                      <div className="w-full h-full flex flex-col items-center gap-10">
                         <div className="relative w-full max-w-2xl aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.6)] bg-black/40 group/img">
                            <img
                              src={selectedDoc}
                              alt="Payment Proof"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                console.error("[Admin] Failed to load proof image:", selectedDoc);
                                (e.target as HTMLImageElement).src = 'https://placehold.co/800x600/0a0a0b/00f2ff?text=Invalid+Document+Stream';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                               <a href={selectedDoc} target="_blank" rel="noopener noreferrer" className="p-4 rounded-full bg-nova-cyan text-black">
                                  <ExternalLink size={24} />
                               </a>
                            </div>
                         </div>

                         {requests.find(r => r.verification_doc_url === selectedDoc || r.proof_url === selectedDoc)?.payment_note && (
                            <div className="max-w-xl w-full p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm shadow-inner">
                               <div className="flex items-center gap-2 mb-4">
                                  <AlertCircle size={14} className="text-nova-purple" />
                                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Applicant Transmission</p>
                               </div>
                               <p className="text-sm md:text-base text-white/60 leading-relaxed italic font-medium">
                                  "{requests.find(r => r.verification_doc_url === selectedDoc || r.proof_url === selectedDoc)?.payment_note}"
                               </p>
                            </div>
                         )}

                         <a
                           href={selectedDoc}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="px-10 py-5 rounded-[2rem] bg-nova-cyan text-black text-[11px] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-all flex items-center gap-3 active:scale-95"
                         >
                            <ExternalLink size={14} /> Open Original Stream
                         </a>
                      </div>
                   ) : (
                      <div className="text-center relative z-10 py-20">
                         <div className="w-24 h-24 rounded-[2rem] border border-nova-cyan/20 bg-nova-cyan/5 flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <AlertCircle size={48} className="text-nova-cyan animate-pulse" />
                         </div>
                         <p className="text-xs md:text-sm uppercase tracking-[0.5em] text-white/40 font-black mb-4">No Document Stream Detected</p>
                         <p className="text-sm md:text-base text-white/20 max-w-sm mx-auto italic font-medium leading-relaxed px-4">
                            This applicant has not attached a visual credential stream to their synchronization request.
                         </p>
                      </div>
                   )}
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
