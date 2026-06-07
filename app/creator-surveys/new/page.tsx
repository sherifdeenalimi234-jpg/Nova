"use client";

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * LEGACY SURVEY ARCHITECT ENTRY POINT
 * This route is deprecated in favor of the Survey Blueprint system (V1).
 * All traffic is now redirected to /creator-surveys/blueprint.
 */
export default function LegacyCreateSurveyPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecting to the modern Survey Blueprint initialization flow
    router.replace('/creator-surveys/blueprint');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-nova-purple/10 flex items-center justify-center text-nova-purple border border-nova-purple/20">
        <Loader2 size={32} className="animate-spin" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-black uppercase tracking-widest mb-2">Redirecting to Blueprint</h2>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Establishing Research Parameters</p>
      </div>
    </div>
  );
}
