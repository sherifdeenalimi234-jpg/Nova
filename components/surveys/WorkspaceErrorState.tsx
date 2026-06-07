"use client";

import React, { useState } from 'react';
import { AlertCircle, ChevronLeft, RefreshCcw, Wrench, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { ensureSurveySchema } from '@/lib/actions/db';

interface WorkspaceErrorStateProps {
  title?: string;
  message?: string;
  isSchemaError?: boolean;
  showHomeButton?: boolean;
}

export default function WorkspaceErrorState({
  title,
  message,
  isSchemaError = false,
  showHomeButton = true
}: WorkspaceErrorStateProps) {
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairStatus, setRepairStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleRepair = async () => {
    setIsRepairing(true);
    try {
      const result = await ensureSurveySchema();
      if (result.success) {
        setRepairStatus('success');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setRepairStatus('error');
      }
    } catch (err) {
      setRepairStatus('error');
    }
    setIsRepairing(false);
  };
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mb-8 border border-red-500/20">
        <AlertCircle size={40} />
      </div>

      <h2 className="text-2xl font-black uppercase tracking-tight mb-4">
        {title || (isSchemaError ? 'Schema Mismatch Detected' : 'Workspace Sync Error')}
      </h2>

      <p className="text-white/40 text-xs uppercase tracking-widest max-w-sm mb-10 leading-relaxed">
        {message || (isSchemaError
          ? 'Your database schema is outdated. Please contact the administrator to run the migration script or use the admin dashboard to repair the surveys table.'
          : 'The requested research node could not be retrieved from the intelligence stream. It may have been decommissioned or access was revoked.')}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        {isSchemaError && repairStatus !== 'success' && (
          <button
            onClick={handleRepair}
            disabled={isRepairing}
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-nova-cyan text-black text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all disabled:opacity-50"
          >
            {isRepairing ? <Loader2 size={14} className="animate-spin" /> : <Wrench size={14} />}
            {repairStatus === 'error' ? 'Repair Failed' : 'Run System Repair'}
          </button>
        )}

        {repairStatus === 'success' && (
          <div className="flex items-center gap-2 text-nova-green text-[10px] font-black uppercase">
            <CheckCircle2 size={16} />
            Schema Repaired. Refreshing...
          </div>
        )}

        {repairStatus !== 'success' && (
          <>
            {showHomeButton && (
              <Link
                href="/creator-surveys"
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                <ChevronLeft size={16} />
                Return to Hub
              </Link>
            )}
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-nova-purple text-white text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] transition-all"
            >
              <RefreshCcw size={14} />
              Retry Connection
            </button>
          </>
        )}
      </div>
    </div>
  );
}
