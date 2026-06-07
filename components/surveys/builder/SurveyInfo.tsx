"use client";

import { useState, useEffect } from 'react';
import { Survey } from '@/lib/types/surveys';
import { updateSurveyDetails } from '@/lib/actions/surveys';
import { Save, Image as ImageIcon, Tag, Clock, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface SurveyInfoProps {
  survey: Survey;
  onUpdate: (updates: Partial<Survey>) => void;
}

const CATEGORIES = [
  'General',
  'Market Research',
  'Customer Feedback',
  'Product Development',
  'Academic',
  'Social',
  'Technology',
  'Healthcare',
  'Entertainment'
];

export default function SurveyInfo({ survey, onUpdate }: SurveyInfoProps) {
  const [formData, setFormData] = useState({
    title: survey.title,
    description: survey.description || '',
    category: survey.category || 'General',
    cover_image: survey.cover_image || '',
    estimated_time: survey.estimated_time || 5,
    tags: survey.tags || []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateSurveyDetails(survey.id, formData);
    if (!result.error) {
      onUpdate(formData);
    }
    setIsSaving(false);
  };

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (JSON.stringify(formData) !== JSON.stringify({
        title: survey.title,
        description: survey.description || '',
        category: survey.category || 'General',
        cover_image: survey.cover_image || '',
        estimated_time: survey.estimated_time || 5,
        tags: survey.tags || []
      })) {
        handleSave();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData]);

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3 ml-1">Survey Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:border-nova-cyan/50 transition-all"
            placeholder="e.g., Q2 Product Feedback"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3 ml-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-nova-cyan/50 transition-all resize-none"
            placeholder="Tell participants what this survey is about..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3 ml-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-sm appearance-none focus:border-nova-cyan/50 transition-all"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3 ml-1 flex items-center gap-1.5">
              <Clock size={12} /> Est. Time (min)
            </label>
            <input
              type="number"
              name="estimated_time"
              value={formData.estimated_time}
              onChange={handleChange}
              className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-nova-cyan/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3 ml-1 flex items-center gap-1.5">
            <ImageIcon size={12} /> Cover Image URL
          </label>
          <input
            type="text"
            name="cover_image"
            value={formData.cover_image}
            onChange={handleChange}
            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-nova-cyan/50 transition-all"
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3 ml-1 flex items-center gap-1.5">
            <Tag size={12} /> Tags
          </label>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-nova-cyan/50 transition-all"
              placeholder="Add a tag..."
            />
            <button
              onClick={addTag}
              className="px-6 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 px-4 py-2 bg-nova-cyan/10 border border-nova-cyan/30 text-nova-cyan rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-white transition-colors">×</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-3 px-8 py-4 bg-nova-cyan text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all disabled:opacity-50"
        >
          <Save size={16} />
          {isSaving ? 'Establishing...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
