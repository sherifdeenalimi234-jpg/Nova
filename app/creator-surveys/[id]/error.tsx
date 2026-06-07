"use client";

import React, { useEffect } from 'react';
import WorkspaceErrorState from '@/components/surveys/WorkspaceErrorState';

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Workspace Runtime Exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
      <WorkspaceErrorState
        title="Node Runtime Error"
        message="A critical disruption occurred during workspace rendering. Our engineers have been notified."
      />
    </div>
  );
}
