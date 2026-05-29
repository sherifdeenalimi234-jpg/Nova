"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldCheck,
  Copy,
  CheckCircle2,
  Upload,
  MessageSquare,
  Mail,
  ChevronRight,
  ArrowLeft,
  Loader2,
  FileText,
  AlertCircle
} from "lucide-react";
import { requestCreatorAccess } from "@/lib/actions/profile";
import { uploadFile } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";

interface CreatorUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

type Step = "pitch" | "payment" | "proof" | "success";

export default function CreatorUpgradeModal({ isOpen, onClose, user }: CreatorUpgradeModalProps) {
  const [step, setStep] = useState<Step>("pitch");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [note, setNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!paymentRef) {
      setError("Please enter a payment reference or your name.");
      return;
    }
    setLoading(true);
    setError(null);
    console.log("[Modal] Initiating submission sequence...");

    try {
      let proofUrl = "";
      if (proofFile) {
        console.log("[Modal] Uploading file to 'creator-proofs'...");
        try {
          proofUrl = await uploadFile(proofFile, "creator-proofs");
          console.log("[Modal] Upload success. URL:", proofUrl);
        } catch (uploadErr: any) {
          console.error("[Modal] Upload step failed:", uploadErr);
          throw new Error(uploadErr.message || "Failed to upload proof image.");
        }
      }

      if (proofFile && !proofUrl) {
        throw new Error("File upload failed to return a valid URL.");
      }

      console.log("[Modal] Transmitting database request via server action...");
      const result = await requestCreatorAccess(paymentRef, proofUrl, note);
      console.log("[Modal] Server action response:", result);

      if (result.error) {
        console.error("[Modal] Server action returned error:", result.error);
        throw new Error(result.error);
      }

      console.log("[Modal] Submission sequence completed successfully.");
      setStep("success");
    } catch (err: any) {
      console.error("[Modal] FATAL Submission failure:", err);
      setError(err.message || "Submission sequence failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep("pitch");
    setProofFile(null);
    setProofPreview(null);
    setPaymentRef("");
    setNote("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a0a0b] border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,242,255,0.1)] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                {step !== "pitch" && step !== "success" && (
                  <button
                    onClick={() => setStep(step === "payment" ? "pitch" : "payment")}
                    className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Creator Verification</h3>
                  <p className="text-[8px] text-nova-cyan font-black uppercase tracking-widest mt-0.5">Protocol 7.4.2</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <AnimatePresence mode="wait">
                {step === "pitch" && (
                  <motion.div
                    key="pitch"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-3xl bg-nova-cyan/10 border border-nova-cyan/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,242,255,0.1)]">
                        <ShieldCheck size={40} className="text-nova-cyan" />
                      </div>
                      <h2 className="text-2xl font-black uppercase tracking-tight">Elevate Your Status</h2>
                      <p className="text-white/40 text-sm leading-relaxed">
                        Join the elite tier of Nova innovators. Unlock professional tools, ecosystem visibility, and premium verification.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        "Professional Portfolio Node",
                        "Unlimited Research Submissions",
                        "Advanced Survey Systems",
                        "Verified Creator Badge",
                        "Direct Collaboration Access"
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                          <div className="w-6 h-6 rounded-lg bg-nova-cyan/20 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={14} className="text-nova-cyan" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6 italic">Activation Fee: ₦6,500</p>
                      <button
                        onClick={() => setStep("payment")}
                        className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-nova-cyan hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all flex items-center justify-center gap-2"
                      >
                        Initiate Activation <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "payment" && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <h4 className="text-sm font-black uppercase tracking-widest text-white/60 mb-2">Transfer Details</h4>
                      <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Complete payment to proceed</p>
                    </div>

                    {/* Payment Card */}
                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-nova-cyan/20 backdrop-blur-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-nova-cyan/5 blur-3xl -mr-16 -mt-16" />

                      <div className="space-y-6 relative z-10">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-nova-cyan mb-1">Bank Institution</p>
                          <p className="text-lg font-black tracking-tight">Opay</p>
                        </div>

                        <div>
                          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-nova-cyan mb-1">Account Number</p>
                          <div className="flex items-center justify-between">
                            <p className="text-2xl font-black tracking-tighter">8107309856</p>
                            <button
                              onClick={() => copyToClipboard("8107309856")}
                              className="p-2 hover:bg-white/5 rounded-xl transition-all group/copy"
                            >
                              {copied ? <CheckCircle2 size={18} className="text-nova-green" /> : <Copy size={18} className="text-white/40 group-hover/copy:text-nova-cyan" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-nova-cyan mb-1">Account Name</p>
                          <p className="text-sm font-bold uppercase tracking-widest">Kudirat Lolade Alimi</p>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Total Amount</span>
                        <span className="text-xl font-black text-white">₦6,500</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setStep("proof")}
                      className="w-full py-4 rounded-2xl bg-nova-cyan text-black text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(0,242,255,0.3)] transition-all flex items-center justify-center gap-2"
                    >
                      I Have Paid <ChevronRight size={14} />
                    </button>

                    <SupportSection />
                  </motion.div>
                )}

                {step === "proof" && (
                  <motion.div
                    key="proof"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <h4 className="text-sm font-black uppercase tracking-widest text-white/60 mb-2">Submit Proof</h4>
                      <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Authenticate your transaction</p>
                    </div>

                    {/* Upload Zone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "p-10 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-4 group",
                        proofPreview ? "border-nova-cyan/50 bg-nova-cyan/5" : "border-white/10 bg-white/[0.02] hover:border-nova-cyan/30 hover:bg-nova-cyan/[0.02]"
                      )}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />

                      {proofPreview ? (
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10">
                          <img src={proofPreview} alt="Proof" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white">Change Image</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:text-nova-cyan transition-colors shadow-[0_0_20px_rgba(255,255,255,0.02)]">
                            <Upload size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white">Upload Receipt</p>
                            <p className="text-[8px] text-white/30 uppercase tracking-widest mt-1">Screenshot or PDF</p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40 ml-4">Payment Reference</label>
                        <input
                          type="text"
                          value={paymentRef}
                          onChange={(e) => setPaymentRef(e.target.value)}
                          placeholder="Your Name or Trans. ID"
                          className="w-full px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white placeholder:text-white/10 focus:outline-none focus:border-nova-cyan/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40 ml-4">Optional Note</label>
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Any message for the admin..."
                          rows={2}
                          className="w-full px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white placeholder:text-white/10 focus:outline-none focus:border-nova-cyan/50 transition-all resize-none"
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 mb-2"
                      >
                        <AlertCircle size={14} className="text-red-500 shrink-0" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-red-500/80 leading-relaxed">
                          {error}
                        </p>
                      </motion.div>
                    )}

                    <button
                      disabled={loading || !proofFile || !paymentRef}
                      onClick={handleSubmit}
                      className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-nova-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {error ? "Retry Transmission" : "Transmit Request"}
                          <ChevronRight size={14} />
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10 space-y-8"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-nova-cyan/20 blur-[60px] animate-pulse" />
                      <div className="w-24 h-24 rounded-[2rem] bg-nova-cyan border border-nova-cyan/20 flex items-center justify-center mx-auto relative z-10">
                        <CheckCircle2 size={48} className="text-black" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-2xl font-black uppercase tracking-tight">Transmission Complete</h2>
                      <p className="text-white/40 text-sm leading-relaxed">
                        Your verification request has been logged into the Nova ecosystem. An administrator will review your credentials shortly.
                      </p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
                       <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest">
                          <span className="text-white/20">Status</span>
                          <span className="text-nova-cyan">Processing</span>
                       </div>
                       <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest">
                          <span className="text-white/20">Estimated Time</span>
                          <span className="text-white">1 - 6 Hours</span>
                       </div>
                    </div>

                    <button
                      onClick={resetAndClose}
                      className="w-full py-4 rounded-2xl border border-white/10 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Return to Dashboard
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function SupportSection() {
  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-nova-purple/20 flex items-center justify-center text-nova-purple">
          <AlertCircle size={16} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Verification Support</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <a
          href="https://wa.me/2347073180242"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-nova-cyan/20 transition-all group"
        >
          <div className="flex items-center gap-4">
            <MessageSquare size={16} className="text-white/20 group-hover:text-nova-cyan transition-colors" />
            <div className="text-left">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/40">WhatsApp</p>
              <p className="text-[10px] font-bold text-white">+234 707 318 0242</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-white/10" />
        </a>

        <a
          href="mailto:officialnovacommunity@gmail.com"
          className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-nova-cyan/20 transition-all group"
        >
          <div className="flex items-center gap-4">
            <Mail size={16} className="text-white/20 group-hover:text-nova-cyan transition-colors" />
            <div className="text-left">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Email</p>
              <p className="text-[10px] font-bold text-white">officialnovacommunity@gmail.com</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-white/10" />
        </a>
      </div>
    </div>
  );
}
