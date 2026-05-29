import React from 'react';
import { createClient } from '@/lib/supabase/server';
import SurveysContent from '@/components/admin/SurveysContent';

export default async function AdminSurveysPage() {
  const supabase = await createClient();

  const { data: surveys } = await supabase
    .from('surveys')
    .select('*, profiles:creator_id(full_name)')
    .order('created_at', { ascending: false });

  return <SurveysContent surveys={surveys || []} />;
}
