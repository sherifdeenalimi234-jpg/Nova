"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Rocket,
  XCircle,
  BarChart3,
  Users,
  Calendar,
  AlertCircle,
  Loader2,
  Inbox,
  Plus,
  Copy,
  RefreshCw
} from 'lucide-react';
import { getCreatorSurveys, updateSurveyStatus, deleteSurvey, duplicateSurvey } from '@/lib/actions/surveys/creator-actions';
import { format } from 'date-fns';
import Link from 'next/link';

export default function SurveyManagementView({ initialSurveys }: { initialSurveys: any[] }) {
  const [surveys, setSurveys] = useState(initialSurveys);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const data = await getCreatorSurveys({ status: filter, search });
      setSurveys(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSurveys();
  }, [filter, search]);

  const handleStatusUpdate = async (id: string, status: any) => {
    setLoading(true);
    try {
      await updateSurveyStatus(id, status);
      fetchSurveys();
    } catch (error) {
      alert("Status update failed");
      setLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    setLoading(true);
    try {
      await duplicateSurvey(id);
      fetchSurveys();
    } catch (error) {
      alert("Duplication failed");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteSurvey(confirmDelete);
      setConfirmDelete(null);
      fetchSurveys();
    } catch (error) {
      alert("Deletion failed");
    }
  };

  const statusTabs = [
    { id: 'all', label: 'All Protocols' },
    { id: 'draft', label: 'Drafts' },
    { id: 'published', label: 'Published' },
    { id: 'closed', label: 'Closed' },
  ];

  return (
    <div className="space-y-10 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Survey <span className="text-nova-purple">Management</span></h1>
           <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Manage ecosystem research signals</p>
        </div>
        <div className="relative group w-full md:max-w-md">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-nova-cyan transition-colors" />
           <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search protocols..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[11px] uppercase tracking-widest text-white placeholder:text-white/20 outline-none focus:border-nova-cyan/50 transition-all shadow-inner"
           />
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
         {statusTabs.map((tab) => (
           <button
             key={tab.id}
             onClick={() => setFilter(tab.id)}
             className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
               filter === tab.id
               ? 'bg-nova-purple text-white border-nova-purple shadow-[0_0_20px_rgba(188,19,254,0.3)]'
               : 'bg-white/5 text-white/40 border-white/10 hover:text-white hover:bg-white/10'
             }`}
           >
              {tab.label}
           </button>
         ))}
      </div>

      {/* Survey List */}
      <div className="grid grid-cols-1 gap-6">
         {loading ? (
           <div className="py-32 flex flex-col items-center justify-center gap-4">
              <Loader2 size={32} className="text-nova-purple animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Syncing Matrix...</p>
           </div>
         ) : surveys.length === 0 ? (
           <div className="py-32 rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-center px-10">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/5">
                 <Inbox size={32} className="text-white/10" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest text-white/40 mb-3">No Signals Found</h3>
              <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] max-w-xs mb-10 leading-relaxed">The ecosystem has no records matching your current filter criteria.</p>
              <Link href="/survey/create" className="px-10 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-nova-cyan transition-all flex items-center gap-3">
                 <Plus size={16} /> Architect New Protocol
              </Link>
           </div>
         ) : (
           <div className="grid grid-cols-1 gap-6">
              {surveys.map((survey) => (
                <motion.div
                  layout
                  key={survey.id}
                  className="p-8 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl group hover:border-white/10 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8"
                >
                   <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                         <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                            survey.status === 'published' ? 'bg-nova-green/10 text-nova-green border-nova-green/20' :
                            survey.status === 'closed' ? 'bg-white/5 text-white/40 border-white/5' :
                            'bg-nova-orange/10 text-nova-orange border-nova-orange/20'
                         }`}>
                            {survey.status}
                         </span>
                         <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-white/20">
                            <Calendar size={12} />
                            {format(new Date(survey.created_at), 'MMM dd, yyyy')}
                         </div>
                      </div>
                      <h3 className="text-xl font-bold group-hover:text-nova-cyan transition-colors mb-2">{survey.title}</h3>
                      <p className="text-[10px] text-nova-cyan/60 font-black uppercase tracking-widest">{survey.category}</p>
                   </div>

                   <div className="flex items-center gap-12 self-start lg:self-center">
                      <div className="text-center">
                         <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-2">Intake</p>
                         <div className="flex items-center gap-2">
                            <Users size={16} className="text-nova-purple" />
                            <span className="text-sm font-black">{survey.response_count}</span>
                         </div>
                      </div>

                      <div className="flex items-center gap-3">
                         {survey.status === 'draft' && (
                           <button
                             onClick={() => handleStatusUpdate(survey.id, 'published')}
                             className="p-4 rounded-2xl bg-nova-green/10 border border-nova-green/20 text-nova-green hover:bg-nova-green hover:text-white transition-all group/btn"
                             title="Publish"
                           >
                              <Rocket size={18} />
                           </button>
                         )}
                         {survey.status === 'published' && (
                           <button
                             onClick={() => handleStatusUpdate(survey.id, 'closed')}
                             className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white transition-all"
                             title="Close"
                           >
                              <XCircle size={18} />
                           </button>
                         )}
                         {survey.status === 'closed' && (
                           <button
                             onClick={() => handleStatusUpdate(survey.id, 'published')}
                             className="p-4 rounded-2xl bg-nova-cyan/10 border border-nova-cyan/20 text-nova-cyan hover:bg-nova-cyan hover:text-white transition-all"
                             title="Reopen"
                           >
                              <RefreshCw size={18} />
                           </button>
                         )}
                         <Link href={`/survey/${survey.id}`} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white transition-all" title="Preview">
                            <Eye size={18} />
                         </Link>
                         <Link href={`/survey/manage/${survey.id}`} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white transition-all" title="Edit">
                            <Edit size={18} />
                         </Link>
                         <button
                           onClick={() => handleDuplicate(survey.id)}
                           className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white transition-all"
                           title="Duplicate"
                         >
                            <Copy size={18} />
                         </button>
                         <Link href={`/survey/responses/${survey.id}`} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white transition-all" title="Analytics">
                            <BarChart3 size={18} />
                         </Link>
                         <button
                           onClick={() => setConfirmDelete(survey.id)}
                           className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
                           title="Delete"
                         >
                            <Trash2 size={18} />
                         </button>
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
         )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="w-full max-w-md bg-[#0a0a0b] border border-white/10 rounded-[2.5rem] p-10 text-center relative overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-20" />
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-8">
                   <AlertCircle size={32} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-4">Purge Protocol?</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-10">This action is irreversible. All associated questions, options, and intelligence data will be permanently deleted from the ecosystem.</p>
                <div className="grid grid-cols-2 gap-4">
                   <button
                     onClick={() => setConfirmDelete(null)}
                     className="py-4 rounded-2xl bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                   >
                      Abort
                   </button>
                   <button
                     onClick={handleDelete}
                     className="py-4 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all"
                   >
                      Confirm Purge
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
