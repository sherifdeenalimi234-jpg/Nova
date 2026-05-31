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
  Clock
} from 'lucide-react';
import ProjectTopBar from '@/components/projects/ProjectTopBar';
import { createClient } from '@/lib/supabase/client';
import NovaErrorModal from '@/components/common/NovaErrorModal';

export default function ProjectDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '', title: '' });
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
        if (user && data.creator_id === user.id) {
          setIsOwner(true);
        }
      }
      setLoading(false);
    }
    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to decommission this innovation node?')) return;
    const { error } = await deleteProject(id);
    if (!error) router.push('/projects');
    else setErrorModal({
      isOpen: true,
      title: "Decommissioning Failed",
      message: error || "Unable to decommission node. System access restricted."
    });
  };

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this node?')) return;
    const { error } = await archiveProject(id);
    if (!error) {
      setProject({ ...project, status: 'Archived' });
    } else setErrorModal({
      isOpen: true,
      title: "Archival Failed",
      message: error || "Unable to archive node. Storage interface error."
    });
  };

  const handleSaveEdit = async () => {
    const { error } = await updateProject(id, editForm);
    if (!error) {
      setProject({ ...project, ...editForm });
      setIsEditing(false);
    } else setErrorModal({
      isOpen: true,
      title: "Update Failed",
      message: error || "Unable to synchronize node parameters."
    });
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
        <h2 className="text-xl font-black uppercase tracking-widest mb-2">Project Not Found</h2>
        <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mb-8">The innovation node you are looking for does not exist or has been decommissioned.</p>
        <button onClick={() => router.push('/projects')} className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest">
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      <ProjectTopBar title={isEditing ? "Edit Node" : "Innovation Node"} />

      {/* Hero Section */}
      <div className="relative h-72 w-full pt-16">
        {project.cover_image ? (
          <img src={project.cover_image} className="w-full h-full object-cover" alt={project.title} />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <Briefcase size={48} className="text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex gap-2 mb-3">
             <span className="px-3 py-1 rounded-full bg-nova-cyan/20 border border-nova-cyan/30 text-[8px] font-black uppercase tracking-widest text-nova-cyan">
                {project.project_type}
             </span>
             <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/60">
                {project.status}
             </span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight">{project.title}</h1>
        </div>
      </div>

      <main className="px-6 space-y-10 mt-6">
        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-4">
           <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1 flex items-center gap-2">
                 <Globe size={10} /> Visibility
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-nova-cyan">{project.visibility}</p>
           </div>
           <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1 flex items-center gap-2">
                 <Calendar size={10} /> Created
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
                 {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
           </div>
           <div className="p-4 rounded-3xl bg-white/5 border border-white/5 col-span-2">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1 flex items-center gap-2">
                 <Clock size={10} /> Last Updated
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
                 {new Date(project.updated_at).toLocaleString()}
              </p>
           </div>
        </div>

        {/* Description Section */}
        <section className="space-y-4">
           <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Specifications</h2>
              <span className="px-2 py-1 rounded bg-nova-cyan/10 text-nova-cyan text-[7px] font-black uppercase tracking-widest">{project.category}</span>
           </div>

           {isEditing ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95">
                 <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-nova-cyan transition-all outline-none"
                    placeholder="Project Name"
                 />
                 <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-nova-cyan transition-all outline-none"
                    placeholder="Category"
                 />
                 <textarea
                    value={editForm.short_description}
                    onChange={(e) => setEditForm({...editForm, short_description: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-nova-cyan transition-all outline-none min-h-[150px] resize-none"
                    placeholder="Description"
                 />
                 <div className="flex gap-4">
                    <button onClick={() => setIsEditing(false)} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                       <X size={14} /> Cancel
                    </button>
                    <button onClick={handleSaveEdit} className="flex-1 py-4 rounded-2xl bg-nova-cyan text-black text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                       <Check size={14} /> Save Changes
                    </button>
                 </div>
              </div>
           ) : (
              <p className="text-[11px] leading-relaxed text-white/60 uppercase tracking-widest whitespace-pre-wrap">
                 {project.short_description}
              </p>
           )}
        </section>

        {/* Action Controls - Only for Owner */}
        {isOwner && !isEditing && (
           <section className="space-y-6 pt-10 border-t border-white/5">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Node Controls</h2>

              <div className="grid grid-cols-1 gap-4">
                 <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-5 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                 >
                    <Edit3 size={18} /> Edit Node Parameters
                 </button>

                 <div className="grid grid-cols-2 gap-4">
                    <button
                       onClick={handleArchive}
                       disabled={project.status === 'Archived'}
                       className="py-5 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-20"
                    >
                       <Archive size={18} /> Archive Node
                    </button>
                    <button
                       onClick={handleDelete}
                       className="py-5 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex flex-col items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/20 transition-all"
                    >
                       <Trash2 size={18} /> Decommission
                    </button>
                 </div>
              </div>
           </section>
        )}
      </main>

      <NovaErrorModal
        isOpen={errorModal.isOpen}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
      />
    </div>
  );
}
