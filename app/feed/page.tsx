"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TopBar from "@/components/hub/TopBar";
import BottomNav from "@/components/navigation/BottomNav";
import RingSystem from "@/components/feed/RingSystem";
import FeedGrid from "@/components/feed/FeedGrid";
import CreatePostModal from "@/components/feed/CreatePostModal";
import ProfileTab from "@/components/feed/ProfileTab";
import { createClient } from "@/lib/supabase/client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FeedPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("explore");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          console.log("No session found in /feed, redirecting to landing...");
          router.push("/");
          return;
        }

        setUser(session.user);
        setIsAuthenticated(true);

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_verified_creator, is_admin')
          .eq('id', session.user.id)
          .single();

        if (profile?.is_admin) {
          console.log("Admin detected on /feed, redirecting to /admin");
          router.push("/admin");
          return;
        }

        if (profile?.is_verified_creator) {
          setIsCreator(true);
        }
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push("/");
      } else if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        // Handled by checkAuth
      } else if (event === 'USER_UPDATED') {
        // Triggered when auth metadata updates, but we also want to re-fetch profile
        checkAuth();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-nova-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-black text-foreground selection:bg-nova-cyan/30 overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b] via-[#050505] to-black" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-repeat" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-nova-cyan/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-nova-purple/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10">
        <TopBar onLogin={() => {}} isAuthenticated={true} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="pt-20 pb-32"
        >
          {activeTab === "explore" && (
            <div className="animate-in fade-in duration-700 relative">
              <RingSystem />
              <FeedGrid />

              {isCreator && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="fixed bottom-24 right-6 w-14 h-14 rounded-2xl bg-nova-cyan shadow-[0_0_20px_rgba(0,242,255,0.4)] flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all z-40 group"
                >
                   <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              )}

              <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
              />
            </div>
          )}

          {activeTab === "home" && (
             <div className="px-6 py-10 text-center mt-20">
                <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-nova-cyan mb-4">Command Center</h2>
                <p className="text-white/40 text-sm">Synchronizing localized innovation data with your profile...</p>
             </div>
          )}

          {activeTab === "profile" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               <ProfileTab />
            </div>
          )}

          {activeTab !== "explore" && activeTab !== "home" && (
            <div className="h-[60vh] flex items-center justify-center p-6 text-center">
               <div className="max-w-xs">
                 <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-nova-cyan/30 flex items-center justify-center animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-nova-cyan/20 blur-sm" />
                 </div>
                 <h2 className="text-2xl font-bold mb-2 uppercase tracking-[0.3em] text-nova-cyan">{activeTab}</h2>
                 <p className="text-white/40 text-sm leading-relaxed">System Module Initializing...</p>
               </div>
            </div>
          )}

          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </motion.div>
      </div>
    </main>
  );
}
