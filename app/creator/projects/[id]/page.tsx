"use client";

import React, { useEffect, useState, use } from 'react';
import {
  ChevronLeft,
  MoreVertical,
  Globe,
  Lock,
  Users2,
  Calendar,
  Clock,
  Briefcase,
  User,
  Settings,
  Trash2,
  Archive,
  Edit3,
  ExternalLink,
  ChevronRight,
  Shield,
  Zap,
  Info,
  Users as UsersIcon,
  Layers,
  FileText,
  Activity,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProject, updateProject, deleteProject, archiveProject } from '@/lib/actions/projects';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = ['Overview', 'Team', 'Tasks', 'Files', 'Activity'];

export default function ProjectWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await getProject(id);
      if (!error && data) {
        setProject(data);
      } else {
        router.push('/creator/projects');
      }
      setLoading(false);
    };
    fetchProject();
  }, [id, router]);

  const handleArchive = async () => {
    if (confirm('Archive this project? It will be moved to the Archived section.')) {
      const { error } = await archiveProject(id);
      if (!error) {
        router.push('/creator/projects');
      }
    }
  };

  const handleDelete = async () => {
    if (confirm('Permanently delete this project? This action cannot be undone.')) {
      setIsDeleting(true);
      const { error } = await deleteProject(id);
      if (!error) {
        router.push('/creator/projects');
      } else {
        setIsDeleting(false);
        alert(error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-nova-cyan border-t-transparent animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Syncing Workspace...</p>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 -mx-8 px-8 py-4 flex items-center justify-between mb-8">
         <div className="flex items-center gap-4">
            <Link href="/creator/projects" className="p-2 -ml-2 text-white/40 hover:text-white transition-colors">
               <ChevronLeft size={20} />
            </Link>
            <h1 className="text-[10px] font-black uppercase tracking-widest line-clamp-1">{project.title}</h1>
         </div>
         <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 text-white/40 hover:text-white transition-colors"
            >
               <MoreVertical size={20} />
            </button>
            <AnimatePresence>
               {showMoreMenu && (
                  <>
                     <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                     <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl z-50 p-2 overflow-hidden"
                     >
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all">
                           <Edit3 size={14} /> Edit Project
                        </button>
                        <button
                           onClick={handleArchive}
                           className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all"
                        >
                           <Archive size={14} /> Archive Node
                        </button>
                        <div className="h-px bg-white/5 my-2" />
                        <button
                           onClick={handleDelete}
                           disabled={isDeleting}
                           className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all"
                        >
                           <Trash2 size={14} /> {isDeleting ? 'Deleting...' : 'Delete Node'}
                        </button>
                     </motion.div>
                  </>
               )}
            </AnimatePresence>
         </div>
      </header>

      {/* Hero Header */}
      <section className="relative rounded-[3rem] overflow-hidden mb-12 border border-white/5">
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
         {project.banner_image ? (
            <img src={project.banner_image} alt="" className="w-full h-80 object-cover" />
         ) : (
            <div className="w-full h-80 bg-gradient-to-br from-nova-cyan/5 to-nova-purple/5" />
         )}

         <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-center gap-6">
               <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-black/40 backdrop-blur-xl border border-white/10 p-1">
                  {project.cover_image ? (
                     <img src={project.cover_image} alt="" className="w-full h-full object-cover rounded-[1.8rem]" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-nova-cyan/20">
                        <Briefcase size={32} />
                     </div>
                  )}
               </div>
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        project.status === 'Active' ? 'bg-nova-cyan/20 text-nova-cyan border border-nova-cyan/30' : 'bg-white/10 text-white/40 border border-white/10'
                     }`}>
                        {project.status}
                     </span>
                     <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-white/40">
                        {project.visibility === 'Public' ? <Globe size={10} /> : project.visibility === 'Private' ? <Lock size={10} /> : <Users2 size={10} />}
                        {project.visibility}
                     </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">{project.title}</h2>
               </div>
            </div>

            <div className="flex gap-4">
               <button className="px-6 py-3 rounded-2xl bg-nova-cyan text-black text-[9px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all">
                  Launch Console
               </button>
            </div>
         </div>
      </section>

      {/* Workspace Navigation */}
      <div className="flex overflow-x-auto pb-4 no-scrollbar border-b border-white/5 mb-10">
         <div className="flex gap-8 min-w-full">
            {TABS.map((tab) => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[10px] font-black uppercase tracking-[0.3em] pb-4 transition-all relative shrink-0 ${
                     activeTab === tab ? 'text-nova-cyan' : 'text-white/20 hover:text-white/40'
                  }`}
               >
                  {tab}
                  {activeTab === tab && (
                     <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-nova-cyan rounded-full"
                     />
                  )}
               </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         {/* Tab Content */}
         <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
               {activeTab === 'Overview' && (
                  <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     className="space-y-12"
                  >
                     {/* Description */}
                     <section className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                           <Info size={14} className="text-nova-cyan" />
                           <h3 className="text-[10px] font-black uppercase tracking-widest">Project Abstract</h3>
                        </div>
                        <div className="p-8 md:p-10 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
                           <p className="text-sm text-white/60 leading-relaxed font-medium whitespace-pre-wrap">
                              {project.full_description}
                           </p>
                        </div>
                     </section>

                     {/* Infrastructure/Tech */}
                     <section className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                           <Zap size={14} className="text-nova-cyan" />
                           <h3 className="text-[10px] font-black uppercase tracking-widest">Innovation Framework</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                           {project.tags?.map((tag: string) => (
                              <div key={tag} className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] flex flex-col items-center gap-3">
                                 <span className="text-[9px] font-black uppercase tracking-widest text-white/60 text-center">{tag}</span>
                              </div>
                           ))}
                           <button className="p-6 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center gap-3 group">
                              <Plus size={16} className="text-white/20 group-hover:text-nova-cyan" />
                              <span className="text-[8px] font-black uppercase tracking-widest text-white/10">Add Tech</span>
                           </button>
                        </div>
                     </section>
                  </motion.div>
               )}

               {activeTab !== 'Overview' && (
                  <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     className="py-20 flex flex-col items-center justify-center text-center space-y-6 rounded-[3rem] border border-dashed border-white/5"
                  >
                     <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/10">
                        {activeTab === 'Team' ? <UsersIcon size={32} /> : activeTab === 'Tasks' ? <Layers size={32} /> : activeTab === 'Files' ? <FileText size={32} /> : <Activity size={32} />}
                     </div>
                     <div>
                        <h4 className="text-lg font-black uppercase tracking-widest mb-2">{activeTab} Integration Pending</h4>
                        <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">This module is coming in Phase 2</p>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Sidebar Stats */}
         <div className="space-y-8">
            <section className="p-10 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-10">
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Node Information</h4>
                  <div className="space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 border border-white/5">
                           <Calendar size={18} />
                        </div>
                        <div>
                           <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Initialization Date</p>
                           <p className="text-[11px] font-black uppercase tracking-widest text-white/80">
                              {new Date(project.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 border border-white/5">
                           <Clock size={18} />
                        </div>
                        <div>
                           <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Last Update Sync</p>
                           <p className="text-[11px] font-black uppercase tracking-widest text-white/80">
                              {new Date(project.updated_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 border border-white/5">
                           <Shield size={18} />
                        </div>
                        <div>
                           <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Node Authority</p>
                           <p className="text-[11px] font-black uppercase tracking-widest text-nova-cyan">Level 1 Protocol</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="pt-10 border-t border-white/5 space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Project Team</h4>
                  <div className="space-y-4">
                     {project.project_members?.map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between group">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                                 {member.profiles?.avatar_url ? (
                                    <img src={member.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/20">
                                       <User size={14} />
                                    </div>
                                 )}
                              </div>
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest group-hover:text-nova-cyan transition-colors">{member.profiles?.full_name}</p>
                                 <p className="text-[7px] text-white/20 uppercase tracking-widest font-black">{member.role}</p>
                              </div>
                           </div>
                           {member.role === 'Owner' && <Shield size={12} className="text-nova-cyan" />}
                        </div>
                     ))}
                     <button className="w-full mt-4 py-4 rounded-2xl border border-dashed border-white/10 text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white/40 hover:bg-white/2 transition-all">
                        Invite Contributor
                     </button>
                  </div>
               </div>
            </section>

            <div className="p-10 rounded-[3rem] bg-gradient-to-br from-nova-cyan/5 to-transparent border border-white/5">
               <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">Quick Links</h4>
               <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/2 border border-white/5 hover:border-nova-cyan/30 transition-all group">
                     <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">Public Showcase</span>
                     <ExternalLink size={12} className="text-white/20 group-hover:text-nova-cyan" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/2 border border-white/5 hover:border-nova-cyan/30 transition-all group">
                     <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">API Endpoint</span>
                     <ExternalLink size={12} className="text-white/20 group-hover:text-nova-cyan" />
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
