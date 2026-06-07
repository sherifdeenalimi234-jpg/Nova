"use client";

import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Inbox,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getCreatorSurveys, updateSurveyStatus, deleteSurvey, duplicateSurvey } from '@/lib/actions/surveys';
import SurveyCard from '@/components/surveys/SurveyCard';
import DeleteSurveyModal from '@/components/surveys/DeleteSurveyModal';
import { Survey } from '@/lib/types/surveys';

export default function SurveysManagementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialStatusFilter = searchParams.get('status') || 'all';

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; title: string }>({
    isOpen: false,
    id: '',
    title: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSurveys(1, true);
  }, []);

  const fetchSurveys = async (pageNum: number, isInitial: boolean = false) => {
    setLoading(true);
    setError(null);
    const res = await getCreatorSurveys(pageNum, pageSize);
    if (res.error) {
      setError("Failed to load surveys. Please try again.");
    } else {
      if (isInitial) {
        setSurveys(res.data || []);
      } else {
        setSurveys(prev => [...prev, ...(res.data || [])]);
      }
      setTotalCount(res.count || 0);
      setPage(pageNum);
    }
    setLoading(false);
  };

  const handleLoadMore = () => {
    fetchSurveys(page + 1);
  };

  const filteredSurveys = useMemo(() => {
    return surveys.filter(survey => {
      if (!survey || !survey.title) return false;
      const matchesSearch = survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (survey.category && survey.category.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || survey.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [surveys, searchQuery, statusFilter]);

  const handleStatusChange = async (id: string, status: 'draft' | 'published' | 'closed') => {
    const res = await updateSurveyStatus(id, status);
    if (!res.error) {
      setSurveys(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    }
  };

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

  const handleDuplicate = async (id: string) => {
    const res = await duplicateSurvey(id);
    if (res.data) {
      setSurveys(prev => [res.data, ...prev]);
    } else {
      alert("Failed to duplicate survey.");
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Surveys' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Drafts' },
    { value: 'closed', label: 'Closed' }
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight mb-2">Sync Error</h2>
        <p className="text-white/40 text-xs mb-8">{error}</p>
        <button
          onClick={() => fetchSurveys(1, true)}
          className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-6">
        <div>
           <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight mb-1">My Surveys</h1>
           <p className="text-white/40 text-[8px] lg:text-[10px] uppercase tracking-[0.4em]">Intelligence assets and node metrics</p>
        </div>
        <Link href="/creator-surveys/blueprint" className="px-5 py-3.5 rounded-2xl bg-nova-purple text-white text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] transition-all flex items-center justify-center gap-2">
           <Plus size={14} />
           New Survey
        </Link>
      </header>

      {/* Filters & Search */}
      <section className="flex flex-col md:flex-row gap-3 lg:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
          <input
            type="text"
            placeholder="Search title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-3.5 lg:py-4 pl-11 pr-6 text-xs lg:text-sm focus:outline-none focus:border-nova-cyan/30 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`whitespace-nowrap px-5 py-3 lg:px-6 lg:py-4 rounded-xl lg:rounded-2xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all border ${
                statusFilter === opt.value
                  ? 'bg-nova-cyan/10 border-nova-cyan/30 text-nova-cyan'
                  : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Survey List */}
      <div className="grid grid-cols-1 gap-6">
         {loading ? (
           [1, 2, 3, 4].map(i => (
             <div key={i} className="h-40 rounded-[2.5rem] bg-white/5 animate-pulse border border-white/5" />
           ))
         ) : filteredSurveys.length > 0 ? (
           filteredSurveys.map((survey) => {
             if (!survey) return null;
             return (
               <SurveyCard
                 key={survey.id}
                 survey={survey}
                 onStatusChange={handleStatusChange}
                 onDelete={(id) => setDeleteModal({ isOpen: true, id, title: survey.title })}
                 onEdit={(id) => router.push(`/creator-surveys/${id}/architect`)}
                 onPreview={(id) => router.push(`/surveys/${id}`)}
                 onDuplicate={handleDuplicate}
               />
             );
           })
         ) : (
           <div className="flex flex-col items-center justify-center py-24 text-center p-8 rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01]">
              <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-white/10 mb-6">
                 <Inbox size={40} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                {statusFilter === 'all' ? 'No Surveys Found' :
                 statusFilter === 'draft' ? 'No Drafts' :
                 statusFilter === 'published' ? 'No Live Surveys' : 'No Closed Surveys'}
              </h3>
              <p className="text-white/40 text-xs max-w-xs mx-auto leading-relaxed mb-8">
                 {searchQuery
                   ? "No results found for your search query. Try different keywords."
                   : statusFilter === 'draft' ? "You don't have any surveys in draft. Start building a new one."
                   : statusFilter === 'published' ? "You haven't published any surveys yet. Make them live to gather data."
                   : statusFilter === 'closed' ? "You don't have any closed surveys at the moment."
                   : "You haven't designed any surveys yet. Start building your data ecosystem today."}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link href="/creator-surveys/blueprint" className="px-8 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-nova-cyan transition-all">
                   Design First Survey
                </Link>
              )}
           </div>
         )}
      </div>

      {surveys.length < totalCount && !searchQuery && statusFilter === 'all' && (
        <div className="flex justify-center pt-10">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
          >
            {loading ? 'Analyzing Data...' : 'Load More Assets'}
          </button>
        </div>
      )}

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
