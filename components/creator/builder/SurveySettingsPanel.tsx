"use client";

import { useState, useEffect } from 'react';
import { Survey, SurveySettings } from '@/lib/types/surveys';
import { updateSurveyDetails } from '@/lib/actions/surveys';
import { Shield, UserCheck, Lock, Globe, Save } from 'lucide-react';

interface SurveySettingsPanelProps {
  survey: Survey;
  onUpdate: (updates: Partial<Survey>) => void;
}

export default function SurveySettingsPanel({ survey, onUpdate }: SurveySettingsPanelProps) {
  const [settings, setSettings] = useState<SurveySettings>(survey.settings);
  const [isSaving, setIsSaving] = useState(false);

  const toggleSetting = (key: keyof SurveySettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateSurveyDetails(survey.id, { settings });
    if (!result.error) {
      onUpdate({ settings });
    }
    setIsSaving(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (JSON.stringify(settings) !== JSON.stringify(survey.settings)) {
        handleSave();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [settings]);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          Privacy & Security
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-white font-medium">Anonymous Responses</p>
                <p className="text-sm text-zinc-400">Do not collect participant identity.</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('anonymous')}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.anonymous ? 'bg-cyan-500' : 'bg-zinc-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.anonymous ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-white font-medium">Limit to One Response</p>
                <p className="text-sm text-zinc-400">Prevent multiple submissions per user.</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('one_response_per_participant')}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.one_response_per_participant ? 'bg-cyan-500' : 'bg-zinc-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.one_response_per_participant ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          Visibility Status
        </h3>
        <p className="text-zinc-400 text-sm mb-4">
          Current Status: <span className="text-cyan-400 uppercase font-bold">{survey.status}</span>
        </p>
        <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
          <p className="text-sm text-cyan-400/80 leading-relaxed">
            {survey.status === 'draft'
              ? "This survey is currently a draft. It is not visible to participants. Complete the validation and publish it to start collecting responses."
              : survey.status === 'published'
              ? "This survey is live and collecting responses. You can unpublish it at any time from the main dashboard."
              : "This survey is closed and no longer accepting responses."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
