"use client";

import React from 'react';
import { Briefcase, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  project: any;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block p-1 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/5 group hover:border-nova-cyan/30 transition-all overflow-hidden"
    >
      <div className="bg-[#0a0a0a] rounded-[2.4rem] overflow-hidden">
        {/* Cover Image */}
        <div className="h-40 relative">
          {project.cover_image ? (
            <img
              src={project.cover_image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <Briefcase size={32} className="text-white/10" />
            </div>
          )}
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
            <span className="text-[8px] font-black uppercase tracking-widest text-nova-cyan">{project.project_type}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-black uppercase tracking-tight group-hover:text-nova-cyan transition-colors truncate">
              {project.title}
            </h3>
            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-white/5 ${
              project.status === 'Active' ? 'text-nova-green' : 'text-white/40'
            }`}>
              {project.status}
            </span>
          </div>

          <p className="text-[10px] text-white/40 uppercase tracking-widest line-clamp-2 mb-6">
            {project.short_description}
          </p>

          <div className="flex items-center justify-between pt-6 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-white/20" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                {new Date(project.updated_at).toLocaleDateString()}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-nova-cyan transition-all">
              <ArrowRight size={14} className="text-white/20 group-hover:text-black" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
