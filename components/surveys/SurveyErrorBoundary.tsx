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

export class SurveyErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Survey Platform Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-black/20 backdrop-blur-xl rounded-[3rem] border border-white/5">
          <div className="w-16 h-16 rounded-3xl bg-nova-purple/10 flex items-center justify-center text-nova-purple mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight mb-2">Survey Node Disruption</h2>
          <p className="text-white/40 text-xs max-w-xs mx-auto mb-8 leading-relaxed">
            The intelligence stream has been interrupted. We've logged the incident and are ready to re-establish the link.
          </p>
          {this.state.error && (
            <div className="mb-8 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-left max-w-lg overflow-auto">
                <p className="text-[10px] font-mono text-red-400 break-words">{this.state.error.message}</p>
                {this.state.error.stack && (
                    <pre className="mt-2 text-[8px] text-white/20 font-mono overflow-x-auto">
                        {this.state.error.stack}
                    </pre>
                )}
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            <RefreshCcw size={14} />
            Re-establish Link
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
