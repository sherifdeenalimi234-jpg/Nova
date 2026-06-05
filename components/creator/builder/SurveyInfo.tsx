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
    <div className="space-y-6 pb-20">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1">Survey Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            placeholder="e.g., Q2 Product Feedback"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none"
            placeholder="Tell participants what this survey is about..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Est. Completion Time (min)
            </label>
            <input
              type="number"
              name="estimated_time"
              value={formData.estimated_time}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" /> Cover Image URL
          </label>
          <input
            type="text"
            name="cover_image"
            value={formData.cover_image}
            onChange={handleChange}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              placeholder="Add a tag..."
            />
            <button
              onClick={addTag}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full text-sm"
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-white">×</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 p-4 lg:relative lg:bottom-0 lg:p-0 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-700 text-black font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Details'}
        </button>
      </div>
    </div>
  );
}
