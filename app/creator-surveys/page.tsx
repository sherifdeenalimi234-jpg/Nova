"use client";

import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Inbox,
  AlertCircle,
  Layout,
  Target,
  Users,
  BarChart3,
  Sparkles,
  Zap,
  CheckCircle2,
  Users2,
  CloudOff,
  Activity,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCreatorSurveys, updateSurveyStatus, deleteSurvey, duplicateSurvey } from '@/lib/actions/surveys';
import { ensureSurveySchema } from '@/lib/actions/db';
import SurveyCard from '@/components/surveys/SurveyCard';
import DeleteSurveyModal from '@/components/surveys/DeleteSurveyModal';
import { Survey } from '@/lib/types/surveys';

export default function SurveysManagementPage() {
  const router = useRouter();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; title: string }>({
    isOpen: false,
    id: '',
    title: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleRunRepair = async () => {
    setIsRepairing(true);
    const res = await ensureSurveySchema();
    if (res.success) {
      alert("Intelligence Node schema repaired successfully.");
      fetchSurveys();
    } else {
      alert("Repair failed: " + res.error);
    }
    setIsRepairing(false);
  };

  const fetchSurveys = async () => {
    setLoading(true);
    setError(null);
    const res = await getCreatorSurveys(1, 100); // Fetch a good amount for the management view
    if (res.error) {
      setError("Failed to load surveys. Please check your connection.");
    } else {
      setSurveys(res.data || []);
    }
    setLoading(false);
  };

  const filteredSurveys = useMemo(() => {
    return surveys.filter(survey => {
      if (!survey || !survey.title) return false;
      return survey.title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [surveys, searchQuery]);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    const res = await deleteSurvey(deleteModal.id);
    if (!res.error) {
      setSurveys(prev => prev.filter(s => s.id !== deleteModal.id));
      setDeleteModal({ isOpen: false, id: '', title: '' });
    } else {
      alert("Failed to delete survey.");
    }
    setIsDeleting(false);
  };

  const handleStatusChange = async (id: string, status: 'draft' | 'published' | 'closed') => {
    const res = await updateSurveyStatus(id, status);
    if (!res.error) {
      setSurveys(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    }
  };

  const handleDuplicate = async (id: string) => {
    const res = await duplicateSurvey(id);
    if (res.data) {
      setSurveys(prev => [res.data, ...prev]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-nova-purple/10 flex items-center justify-center border border-nova-purple/20">
          <Activity size={24} className="text-nova-purple animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Syncing Node Metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight mb-2">Interface Sync Error</h2>
        <p className="text-white/40 text-xs mb-8 uppercase tracking-widest">{error}</p>
        <button
          onClick={fetchSurveys}
          className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // ZERO STATE: No surveys created yet
  if (surveys.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 py-10 lg:py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center space-y-4">
           <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tight">Welcome to Creator Surveys</h1>
           <p className="text-white/40 text-sm lg:text-base font-medium max-w-lg mx-auto">
             Create and manage surveys, collect responses, and analyze insights through the Nova Intelligence ecosystem.
           </p>
        </div>

        <div className="flex justify-center">
           <Link
             href="/creator-surveys/blueprint"
             className="px-12 py-5 rounded-[2rem] bg-nova-purple text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_15px_40px_rgba(188,19,254,0.3)] hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-4 group"
           >
              <Plus size={18} />
              <span>Create First Survey</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-10">
           {[
             { label: 'Survey Workspace', icon: Layout, color: 'text-nova-cyan' },
             { label: 'Logic Builder', icon: Target, color: 'text-nova-purple' },
             { label: 'Live Surveys', icon: Activity, color: 'text-nova-green' },
             { label: 'AI Survey Lab', icon: Sparkles, color: 'text-nova-cyan' },
             { label: 'Analytics', icon: BarChart3, color: 'text-nova-purple' },
             { label: 'Collaboration', icon: Users2, color: 'text-nova-green' },
             { label: 'Offline Sync', icon: CloudOff, color: 'text-nova-cyan' },
           ].map((feature, idx) => (
             <div key={idx} className="flex items-center gap-4 p-5 rounded-3xl bg-white/[0.02] border border-white/5">
                <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${feature.color}`}>
                   <feature.icon size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">✓ {feature.label}</span>
             </div>
           ))}
        </div>

        <div className="pt-10 flex flex-col items-center opacity-20">
           <Inbox size={48} className="mb-4" />
           <p className="text-[10px] font-black uppercase tracking-widest">No surveys created yet.</p>
        </div>
      </div>
    );
  }

  // ACTIVE STATE: User has surveys
  return (
    <div className="space-y-8 lg:space-y-12 pb-20 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight mb-2">Creator Surveys</h1>
           <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Intelligence assets and research nodes</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRunRepair}
            disabled={isRepairing}
            className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
             <Activity size={16} className={isRepairing ? 'animate-spin' : ''} />
             {isRepairing ? 'Repairing...' : 'Sync Schema'}
          </button>
          <Link
            href="/creator-surveys/blueprint"
            className="px-8 py-4 rounded-2xl bg-nova-purple text-white text-[10px] font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(188,19,254,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
             <Plus size={16} />
             Create Survey
          </Link>
        </div>
      </header>

      {/* Search & Filter */}
      <section className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-nova-cyan transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search survey nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-sm focus:outline-none focus:border-nova-cyan/50 focus:bg-white/[0.05] transition-all placeholder:text-white/10 font-medium"
        />
      </section>

      {/* Recent Surveys List */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
           <Zap size={14} className="text-nova-cyan" />
           <h3 className="text-xs font-black uppercase tracking-widest text-white/60">Recent Surveys</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:gap-6">
           {filteredSurveys.length > 0 ? (
             filteredSurveys.map((survey) => (
               <SurveyCard
                 key={survey.id}
                 survey={survey}
                 onStatusChange={handleStatusChange}
                 onDelete={(id) => setDeleteModal({ isOpen: true, id, title: survey.title })}
                 onEdit={(id) => router.push(`/creator-surveys/${id}`)}
                 onPreview={(id) => router.push(`/surveys/${id}`)}
                 onDuplicate={handleDuplicate}
               />
             ))
           ) : (
             <div className="py-20 flex flex-col items-center text-center opacity-30">
                <Search size={40} className="mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">No matching nodes found</p>
             </div>
           )}
        </div>
      </section>

      <DeleteSurveyModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: '', title: '' })}
        onConfirm={handleDeleteConfirm}
        surveyTitle={deleteModal.title}
        isDeleting={isDeleting}
      />
    </div>
  );
}
