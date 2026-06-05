"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MoreVertical,
  Users,
  Calendar,
  Edit3,
  Eye,
  Send,
  PauseCircle,
  Trash2,
  Copy,
  BarChart3,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Survey } from '@/lib/types/surveys';

interface SurveyCardProps {
  survey: Survey;
  onStatusChange: (id: string, status: 'draft' | 'published' | 'closed') => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onPreview: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export default function SurveyCard({
  survey,
  onStatusChange,
  onDelete,
  onEdit,
  onPreview,
  onDuplicate
}: SurveyCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const responseCount = survey.survey_responses?.[0]?.count || 0;

  const statusConfig = {
    draft: { color: 'bg-nova-orange/10 text-nova-orange', label: 'Draft' },
    published: { color: 'bg-nova-green/10 text-nova-green', label: 'Live' },
    closed: { color: 'bg-white/5 text-white/40', label: 'Closed' }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="relative p-5 lg:p-6 rounded-[2rem] lg:rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl group hover:border-white/10 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-6">
        <div className="flex-1 space-y-2 lg:space-y-3">
          <div className="flex items-center gap-2 lg:gap-3">
            <span className={`px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-full text-[7px] lg:text-[8px] font-black uppercase tracking-widest ${statusConfig[survey.status].color}`}>
              {statusConfig[survey.status].label}
            </span>
            <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-white/20 flex items-center gap-1">
              <Calendar size={9} />
              {formatDate(survey.created_at)}
            </span>
            {survey.category && (
              <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-nova-cyan/60">
                {survey.category}
              </span>
            )}
          </div>

          <h3 className="text-base lg:text-lg font-black group-hover:text-nova-cyan transition-colors line-clamp-1">
            {survey.title}
          </h3>

          <div className="flex items-center gap-3 lg:gap-4 text-[9px] lg:text-[10px] text-white/40">
            <div className="flex items-center gap-1">
              <Users size={11} className="text-nova-cyan" />
              <span className="font-bold text-white">{responseCount}</span>
              <span className="uppercase tracking-[0.1em]">Resp.</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={11} />
              <span className="uppercase tracking-[0.1em]"> {formatDate(survey.updated_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <button
            onClick={() => onPreview(survey.id)}
            className="hidden lg:flex p-3 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
            title="Preview"
          >
            <Eye size={18} />
          </button>

          <button
            onClick={() => onEdit(survey.id)}
            className="flex-1 lg:flex-none px-5 py-3 rounded-xl lg:rounded-2xl bg-white/5 border border-white/5 text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Edit3 size={13} />
            Edit
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-3 rounded-xl lg:rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <MoreVertical size={16} />
            </button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-56 rounded-3xl bg-black/90 backdrop-blur-2xl border border-white/10 p-2 shadow-2xl z-50 overflow-hidden"
                  >
                    {survey.status !== 'published' && (
                      <button
                        onClick={() => { onStatusChange(survey.id, 'published'); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-nova-green hover:bg-nova-green/10 transition-all"
                      >
                        <Send size={14} />
                        Publish Survey
                      </button>
                    )}
                    {survey.status === 'published' && (
                      <button
                        onClick={() => { onStatusChange(survey.id, 'closed'); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all"
                      >
                        <PauseCircle size={14} />
                        Close Survey
                      </button>
                    )}
                    {survey.status === 'closed' && (
                      <button
                        onClick={() => { onStatusChange(survey.id, 'published'); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-nova-cyan hover:bg-nova-cyan/10 transition-all"
                      >
                        <Send size={14} />
                        Reopen Survey
                      </button>
                    )}
                    <button
                      onClick={() => { onDuplicate(survey.id); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all"
                    >
                      <Copy size={14} />
                      Duplicate
                    </button>
                    <Link
                      href={`/surveys/${survey.id}/analytics`}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all"
                    >
                      <BarChart3 size={14} />
                      View Analytics
                    </Link>
                    <div className="h-px bg-white/5 my-1" />
                    <button
                      onClick={() => { onDelete(survey.id); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={14} />
                      Delete Survey
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
