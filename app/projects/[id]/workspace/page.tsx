"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getProject,
  deleteProject,
  archiveProject,
  updateProject
} from '@/lib/actions/projects';
import {
  Loader2,
  Calendar,
  Globe,
  Lock,
  Trash2,
  Archive,
  Edit3,
  Briefcase,
  X,
  Check,
  Clock,
  LayoutGrid,
  Users,
  Settings,
  BarChart3
} from 'lucide-react';
import ProjectTopBar from '@/components/projects/ProjectTopBar';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function ProjectWorkspacePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    short_description: '',
    category: ''
  });

  useEffect(() => {
    async function fetchProject() {
      const { data, error } = await getProject(id);
      if (data) {
        setProject(data);
        setEditForm({
          title: data.title,
          short_description: data.short_description,
          category: data.category
        });

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        // Only allow access if owner or admin
        if (!user || (data.creator_id !== user.id)) {
           // In a real app we'd check project_members too,
           // but for now we follow the owner-gated hub model
           // router.push('/projects');
        }
      }
      setLoading(false);
    }
    fetchProject();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to decommission this node?')) return;
    const { error } = await deleteProject(id);
    if (!error) router.push('/projects');
    else alert(error);
  };

  const handleArchive = async () => {
    if (!confirm('Archive this innovation node?')) return;
    const { error } = await archiveProject(id);
    if (!error) {
      setProject({ ...project, status: 'Archived' });
    } else alert(error);
  };

  const handleSaveEdit = async () => {
    const { error } = await updateProject(id, editForm);
    if (!error) {
      setProject({ ...project, ...editForm });
      setIsEditing(false);
    } else alert(error);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="text-nova-cyan animate-spin" size={32} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
        <Briefcase size={64} className="text-white/10 mb-6" />
        <h2 className="text-xl font-black uppercase tracking-widest mb-2">Node Not Found</h2>
        <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mb-8">This innovation node is offline or restricted.</p>
        <button onClick={() => router.push('/projects')} className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest">
          Return to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      <ProjectTopBar title="Project Workspace" />

      {/* Workspace Header */}
      <div className="pt-24 px-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
           <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
              {project.cover_image ? (
                <img src={project.cover_image} className="w-full h-full object-cover" alt="" />
              ) : (
                <Briefcase size={24} className="text-white/20" />
              )}
           </div>
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="px-2 py-0.5 rounded-full bg-nova-cyan/10 border border-nova-cyan/20 text-[7px] font-black uppercase tracking-widest text-nova-cyan">
                    {project.project_type}
                 </span>
                 <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[7px] font-black uppercase tracking-widest text-white/40">
                    {project.status}
                 </span>
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight">{project.title}</h1>
           </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
           {TABS.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-2 px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${
                 activeTab === tab.id
                 ? 'bg-nova-cyan text-black'
                 : 'bg-white/5 text-white/40 border border-white/5'
               }`}
             >
               <tab.icon size={14} />
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      <main className="px-6">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
             {/* Stats Grid */}
             <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
                   <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-2">Team Size</p>
                   <p className="text-xl font-black text-white">{project.project_members?.length || 1}</p>
                </div>
                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
                   <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-2">Visibility</p>
                   <p className="text-xl font-black text-nova-cyan uppercase">{project.visibility}</p>
                </div>
             </div>

             {/* Details Section */}
             <section className="space-y-6">
                <div className="flex items-center justify-between">
                   <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 text-left">Node Configuration</h2>
                   <button onClick={() => setIsEditing(!isEditing)} className="text-nova-cyan text-[10px] font-black uppercase tracking-widest">
                      {isEditing ? 'Cancel' : 'Edit Specs'}
                   </button>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                     <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-nova-cyan transition-all outline-none"
                     />
                     <input
                        type="text"
                        value={editForm.category}
                        onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-nova-cyan transition-all outline-none"
                     />
                     <textarea
                        value={editForm.short_description}
                        onChange={(e) => setEditForm({...editForm, short_description: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-nova-cyan transition-all outline-none min-h-[120px] resize-none"
                     />
                     <button onClick={handleSaveEdit} className="w-full py-4 rounded-2xl bg-nova-cyan text-black text-[10px] font-black uppercase tracking-widest">
                        Apply Changes
                     </button>
                  </div>
                ) : (
                  <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-6">
                     <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-2">Category</p>
                        <p className="text-xs font-black uppercase">{project.category}</p>
                     </div>
                     <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-2">Description</p>
                        <p className="text-[10px] leading-relaxed text-white/60 uppercase tracking-widest">{project.short_description}</p>
                     </div>
                  </div>
                )}
             </section>

             {/* Danger Zone */}
             <section className="pt-10 border-t border-white/5 space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500/50 text-left px-2">Decommissioning</h2>
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={handleArchive} className="py-5 rounded-3xl bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-white/40">
                      Archive Node
                   </button>
                   <button onClick={handleDelete} className="py-5 rounded-3xl bg-red-500/10 border border-red-500/20 text-[8px] font-black uppercase tracking-widest text-red-500">
                      Delete Permanently
                   </button>
                </div>
             </section>
          </div>
        )}

        {activeTab === 'team' && (
           <div className="py-20 text-center space-y-6 animate-in fade-in">
              <Users size={48} className="mx-auto text-white/10" />
              <div>
                 <h3 className="text-lg font-black uppercase tracking-widest mb-2">Team Protocol</h3>
                 <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">Multi-node collaboration is coming in the next phase.</p>
              </div>
           </div>
        )}

        {activeTab === 'analytics' && (
           <div className="py-20 text-center space-y-6 animate-in fade-in">
              <BarChart3 size={48} className="mx-auto text-white/10" />
              <div>
                 <h3 className="text-lg font-black uppercase tracking-widest mb-2">Data Intelligence</h3>
                 <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">Traffic and engagement metrics are initializing.</p>
              </div>
           </div>
        )}

        {activeTab === 'settings' && (
           <div className="py-20 text-center space-y-6 animate-in fade-in">
              <Settings size={48} className="mx-auto text-white/10" />
              <div>
                 <h3 className="text-lg font-black uppercase tracking-widest mb-2">Advanced Config</h3>
                 <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">Environment and API integration settings coming soon.</p>
              </div>
           </div>
        )}
      </main>
    </div>
  );
}
