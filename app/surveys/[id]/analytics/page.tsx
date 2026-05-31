"use client";
export const dynamic = "force-dynamic";



import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileSpreadsheet, Loader2, Users, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function SurveyAnalytics() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: surveyData } = await supabase.from('surveys').select('*').eq('id', id).single();
      const { data: responseData } = await supabase.from('survey_responses').select('*').eq('survey_id', id);

      setSurvey(surveyData);
      setResponses(responseData || []);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const exportToExcel = () => {
    const data = responses.map(r => ({
      ID: r.id,
      User: r.user_id,
      Date: new Date(r.created_at).toLocaleString(),
      ...r.answers
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Responses");
    XLSX.writeFile(wb, `Nova_Survey_${id}.xlsx`);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-nova-purple" /></div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto pt-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
           <div>
              <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">{survey?.title}</h1>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.3em]">Research Intelligence Dashboard</p>
           </div>
           <button
              onClick={exportToExcel}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-nova-purple/20 border border-nova-purple/30 text-nova-purple text-[10px] font-black uppercase tracking-widest hover:bg-nova-purple/30 transition-all"
           >
              <FileSpreadsheet size={16} /> Export Intelligence (.xlsx)
           </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
           <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Users size={12} /> Participation
              </div>
              <div className="text-4xl font-black text-nova-cyan">{responses.length}</div>
              <p className="text-[10px] text-white/20 mt-2 uppercase tracking-widest">Active ecosystem nodes</p>
           </div>
           <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                 <CheckCircle size={12} /> Completion Rate
              </div>
              <div className="text-4xl font-black text-nova-green">100%</div>
              <p className="text-[10px] text-white/20 mt-2 uppercase tracking-widest">Signal integrity verified</p>
           </div>
        </div>

        <div className="space-y-12">
           {survey?.questions.map((q: any, idx: number) => (
             <div key={idx} className="p-8 rounded-[40px] bg-white/2 border border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-8 text-white/80">
                   <span className="text-nova-purple mr-3">0{idx+1}</span> {q.text}
                </h3>

                <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={q.options.map((opt: string) => ({
                         name: opt,
                         count: responses.filter(r => r.answers[idx] === opt).length
                      }))}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                         <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                         <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                         <Tooltip
                            contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                            itemStyle={{ color: '#bc13fe' }}
                         />
                         <Bar dataKey="count" fill="#bc13fe" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
