"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class CreatorErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Creator Workspace Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-black/20 backdrop-blur-xl rounded-[3rem] border border-white/5">
          <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight mb-2">Workspace Disruption</h2>
          <p className="text-white/40 text-xs max-w-xs mx-auto mb-8 leading-relaxed">
            The neural link has been interrupted. We've logged the incident and are ready to reconnect.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            <RefreshCcw size={14} />
            Re-initialize
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
