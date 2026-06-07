"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Terminal } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class SurveyErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("Survey Workspace Critical Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-[#050505] text-white">
          <div className="w-20 h-20 rounded-[2.5rem] bg-red-500/10 flex items-center justify-center text-red-500 mb-8 border border-red-500/20">
            <AlertCircle size={40} />
          </div>

          <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Workspace Disruption</h2>

          <div className="max-w-2xl w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6 mb-8 text-left overflow-hidden">
             <div className="flex items-center gap-2 mb-4 text-red-400">
                <Terminal size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Exception Trace</span>
             </div>
             <div className="font-mono text-[11px] text-white/60 space-y-2 break-all">
                <p className="text-white font-bold">{this.state.error?.toString()}</p>
                <div className="h-px bg-white/5 my-2" />
                <p className="text-[9px] opacity-40 leading-relaxed whitespace-pre-wrap">
                   {this.state.error?.stack}
                </p>
                {this.state.errorInfo && (
                   <>
                    <div className="h-px bg-white/5 my-2" />
                    <p className="text-[9px] opacity-40 leading-relaxed">
                       Component Stack: {this.state.errorInfo.componentStack}
                    </p>
                   </>
                )}
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-nova-cyan transition-all"
            >
              <RefreshCcw size={14} />
              Re-initialize Workspace
            </button>
            <button
              onClick={() => window.location.href = '/creator-surveys'}
              className="flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Return to Hub
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
