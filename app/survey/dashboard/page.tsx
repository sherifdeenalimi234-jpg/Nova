import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getCreatorDashboardStats, getRecentActivity } from '@/lib/actions/surveys/creator-actions';
import SurveyDashboard from '@/components/survey/SurveyDashboard';

export default async function SurveyDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get profile data for the welcome message
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id)
    .single();

  const stats = await getCreatorDashboardStats();
  const recentActivity = await getRecentActivity();

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24">
      <SurveyDashboard
        stats={stats}
        recentActivity={recentActivity}
        user={profile}
      />
    </div>
  );
}
