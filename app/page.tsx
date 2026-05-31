"use client";
export const dynamic = "force-dynamic";



import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CinematicIntro from "@/components/intro/CinematicIntro";
import ProfileSlides from "@/components/intro/ProfileSlides";
import TopBar from "@/components/hub/TopBar";
import HeroDashboard from "@/components/hub/HeroDashboard";
import ModuleGrid from "@/components/hub/ModuleGrid";
import ActivityFeed from "@/components/hub/ActivityFeed";
import FooterMap from "@/components/hub/FooterMap";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type AppPhase = "intro" | "profiles" | "hub";

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("intro");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const checkInitialAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setIsAuthenticated(true);
          // Redirect authenticated users to their proper destination
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();

          if (profile?.is_admin) {
            router.push('/admin');
          } else {
            router.push('/feed');
          }
        }
      } catch (e) {
        console.error("Auth check failed:", e);
      } finally {
        setLoading(false);
      }
    };

    checkInitialAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        setIsAuthenticated(true);
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (profile?.is_admin) {
          router.push('/admin');
        } else {
          router.push('/feed');
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const nextPhase = () => {
    if (phase === "intro") setPhase("profiles");
    else if (phase === "profiles") setPhase("hub");
  };

  const handleLogin = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      console.error('Login error:', error.message);
      alert('Authentication failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-nova-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If authenticated, we should be redirecting, but render nothing to prevent flash
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-nova-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-foreground selection:bg-nova-cyan/30 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10"
          >
            <CinematicIntro onComplete={nextPhase} />
          </motion.div>
        )}

        {phase === "profiles" && (
          <motion.div
            key="profiles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10"
          >
            <ProfileSlides onComplete={nextPhase} />
          </motion.div>
        )}

        {phase === "hub" && (
          <motion.div
            key="hub"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative z-10"
          >
            <TopBar onLogin={handleLogin} isAuthenticated={false} />

            <div className="pt-4">
                <motion.div
                  key="unauthenticated-hub"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="animate-in fade-in duration-1000"
                >
                  <HeroDashboard />
                  <ModuleGrid onAction={handleLogin} />
                  <ActivityFeed />
                  <FooterMap />
                </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
