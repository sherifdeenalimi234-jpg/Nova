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
  RefreshCcw
} from 'lucide-react';
import { moderatePremiumRequest } from '@/lib/actions/admin';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    const { error } = await moderatePremiumRequest(id, status);
    if (!error) {
      setRequests(requests.filter(r => r.id !== id));
      router.refresh();
    } else {
      alert("Verification sequence failed: " + (error as any).message);
    }
    setProcessingId(null);
  };

  const filteredRequests = requests.filter(r =>
    r.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base md:text-lg font-bold tracking-widest uppercase text-white leading-none">Creator Intake</h3>
          <p className="text-[9px] md:text-[10px] text-white/30 uppercase tracking-widest mt-2 font-medium">Awaiting authentication</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-nova-purple/10 border border-nova-purple/20 text-[9px] font-black text-nova-purple uppercase tracking-widest">
          {filteredRequests.length} PENDING
        </span>
      </div>

      <div className="relative group">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-nova-purple transition-colors" />
        <input
          type="text"
          placeholder="Filter applications by name, email or reference..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/2 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-[10px] uppercase tracking-widest text-white placeholder:text-white/20 outline-none focus:border-nova-purple/50 transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar min-h-[400px]">
        {filteredRequests.length === 0 ? (
          <div className="h-60 rounded-3xl border border-dashed border-white/5 flex flex-col items-center justify-center text-white/10 gap-4">
            <div className="p-4 rounded-full bg-white/2">
              <ShieldCheck size={32} className="opacity-20" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-black">Queue Neutralized</span>
          </div>
        ) : (
          filteredRequests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-3xl bg-white/2 border border-white/5 hover:border-nova-purple/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-nova-purple/5 blur-[40px] pointer-events-none" />

              <div className="flex items-center gap-4 mb-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-nova-purple/10 flex items-center justify-center border border-nova-purple/20 overflow-hidden shrink-0">
                   {req.profiles?.avatar_url ? (
                     <img src={req.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                   ) : (
                     <User size={20} className="text-nova-purple/40" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-black text-white truncate">{req.profiles?.full_name || 'Anonymous User'}</h4>
                      <span className="px-1.5 py-0.5 rounded-md bg-nova-purple/20 text-nova-purple text-[8px] font-black uppercase tracking-tighter">
                         {req.category || 'INNOVATOR'}
                      </span>
                   </div>
                   <div className="flex flex-col gap-0.5">
                      <p className="text-[9px] text-white/40 uppercase tracking-widest font-medium truncate">{req.profiles?.email || 'No email associated'}</p>
                      <p className="text-[10px] text-nova-cyan uppercase tracking-widest font-mono truncate">REF: {req.payment_reference}</p>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 relative z-10">
                 <button
                   onClick={() => setSelectedDoc(req.proof_url || req.verification_doc_url || '#')}
                   className="col-span-2 flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest hover:text-nova-cyan hover:border-nova-cyan/20 transition-all mb-2"
                 >
                    <div className="flex items-center gap-2">
                       <FileText size={14} className="text-nova-cyan" />
                       View Payment Proof
                    </div>
                    <ChevronRight size={14} />
                 </button>

                 {processingId === req.id ? (
                   <div className="col-span-2 flex items-center justify-center py-3">
                      <Loader2 size={20} className="animate-spin text-nova-purple" />
                   </div>
                 ) : (
                   <div className="col-span-2 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleAction(req.id, 'approved')}
                      className="flex items-center justify-center gap-1.5 py-3.5 rounded-2xl bg-nova-cyan/10 text-nova-cyan text-[8px] font-black uppercase tracking-widest hover:bg-nova-cyan/20 transition-all border border-nova-cyan/20 shadow-[0_0_15px_rgba(0,242,255,0.1)]"
                    >
                        <ShieldCheck size={12} /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'rejected')}
                      className="flex items-center justify-center gap-1.5 py-3.5 rounded-2xl bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-widest hover:bg-nova-purple/10 hover:text-nova-purple transition-all border border-white/5"
                    >
                        <RefreshCcw size={12} /> Request New
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'rejected')}
                      className="flex items-center justify-center py-3.5 rounded-2xl bg-white/5 text-white/20 hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5"
                    >
                        <XCircle size={14} />
                    </button>
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-xl"
          >
             <motion.div
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               className="relative w-full max-w-4xl h-[80vh] md:h-full bg-neutral-900 rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)]"
             >
                <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-black/20">
                   <div>
                      <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white">Security Credential</h3>
                      <p className="text-[9px] text-white/30 uppercase tracking-widest mt-1">Verification Stream: 4.9.1</p>
                   </div>
                   <button
                     onClick={() => setSelectedDoc(null)}
                     className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all"
                   >
                      <XCircle size={20} />
                   </button>
                </div>
                <div className="flex-1 bg-black/80 flex flex-col items-center justify-center p-6 md:p-10 relative overflow-y-auto">
                   {/* Background Glow */}
                   <div className="absolute inset-0 bg-nova-cyan/2 blur-[80px]" />

                   {selectedDoc && selectedDoc !== '#' ? (
                      <div className="w-full h-full flex flex-col items-center gap-8">
                         <div className="relative w-full max-w-2xl aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black/40">
                            <img
                              src={selectedDoc}
                              alt="Payment Proof"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/0a0a0b/00f2ff?text=Invalid+Document+URL';
                              }}
                            />
                         </div>

                         {filteredRequests.find(r => r.verification_doc_url === selectedDoc || r.proof_url === selectedDoc)?.payment_note && (
                            <div className="max-w-xl w-full p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
                               <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-3">Applicant Note</p>
                               <p className="text-sm text-white/60 leading-relaxed italic">
                                  "{filteredRequests.find(r => r.verification_doc_url === selectedDoc || r.proof_url === selectedDoc)?.payment_note}"
                               </p>
                            </div>
                         )}

                         <a
                           href={selectedDoc}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="px-8 py-3 rounded-2xl bg-nova-cyan text-black text-[9px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all flex items-center gap-2"
                         >
                            <ExternalLink size={12} /> Open Original Document
                         </a>
                      </div>
                   ) : (
                      <div className="text-center relative z-10">
                         <div className="w-20 h-20 rounded-3xl border border-nova-cyan/20 bg-nova-cyan/5 flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={40} className="text-nova-cyan animate-pulse" />
                         </div>
                         <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/40 font-black">No Document Stream Detected</p>
                         <p className="text-xs md:text-sm text-white/20 mt-6 max-w-xs mx-auto italic font-medium leading-relaxed">
                            This applicant has not attached a visual credential stream to their request.
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
