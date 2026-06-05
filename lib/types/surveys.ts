export interface Survey {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  questions: any[];
  category: string;
  status: 'draft' | 'published' | 'closed';
  created_at: string;
  updated_at: string;
  survey_responses?: { count: number }[];
}

export interface SurveyStats {
  total: number;
  active: number;
  draft: number;
  closed: number;
  totalResponses: number;
}
