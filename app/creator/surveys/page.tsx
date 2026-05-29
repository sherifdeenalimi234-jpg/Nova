"use client";

import React from 'react';
import {
  Plus,
  Search,
  Users,
  BarChart3,
  MoreVertical,
  Download
} from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

export default function SurveysManagementPage() {
  const surveys = [
    { id: '1', title: 'Ecosystem Dynamics v1', responses: 842, status: 'Live', date: 'Oct 20, 2024' },
    { id: '2', title: 'Member Feedback Node', responses: 124, status: 'Closed', date: 'Oct 15, 2024' },
    { id: '3', title: 'Research Interest Survey', responses: 0, status: 'Draft', date: 'Oct 25, 2024' },
  ];

  const exportToExcel = (surveyTitle: string) => {
    const ws = XLSX.utils.json_to_sheet([
      { Question: "How satisfied are you?", Answer: "Very", User: "Node_842" },
      { Question: "Next feature?", Answer: "AI Analysis", User: "Node_124" },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Responses");
    XLSX.writeFile(wb, `${surveyTitle.replace(/\s+/g, '_')}_Responses.xlsx`);
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Surveys</h1>
           <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Gather ecosystem intelligence and data</p>
        </div>
        <Link href="/creator/surveys/new" className="px-6 py-3 rounded-2xl bg-nova-purple text-white text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] transition-all flex items-center gap-2">
           <Plus size={14} />
           Architect Survey
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-6">
         {surveys.map((survey) => (
           <div key={survey.id} className="p-8 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl group hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex-1">
                 <div className="flex items-center gap-4 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${
                       survey.status === 'Live' ? 'bg-nova-green/10 text-nova-green' :
                       survey.status === 'Closed' ? 'bg-white/5 text-white/40' :
                       'bg-nova-orange/10 text-nova-orange'
                    }`}>
                       {survey.status}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20">{survey.date}</span>
                 </div>
                 <h3 className="text-lg font-black group-hover:text-nova-cyan transition-colors">{survey.title}</h3>
              </div>

              <div className="flex items-center gap-12">
                 <div className="text-center">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Responses</p>
                    <div className="flex items-center gap-2">
                       <Users size={14} className="text-nova-cyan" />
                       <span className="text-sm font-black">{survey.responses}</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <button
                      onClick={() => exportToExcel(survey.title)}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                      title="Export Data"
                    >
                       <Download size={18} />
                    </button>
                    <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                       <BarChart3 size={18} />
                    </button>
                    <button className="p-2 text-white/20 hover:text-white">
                       <MoreVertical size={16} />
                    </button>
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
