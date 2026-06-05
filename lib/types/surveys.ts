export type SurveyStatus = 'draft' | 'published' | 'closed';
export type QuestionType = 'short_text' | 'long_text' | 'single_choice' | 'multiple_choice' | 'dropdown' | 'rating';

export interface SurveySettings {
  anonymous: boolean;
  one_response_per_participant: boolean;
}

export interface Survey {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: SurveyStatus;
  cover_image: string | null;
  estimated_time: number;
  tags: string[];
  settings: SurveySettings;
  created_at: string;
  updated_at: string;
  // Join data
  questions?: SurveyQuestion[];
  response_count?: number;
}

export interface SurveyQuestion {
  id: string;
  survey_id: string;
  type: QuestionType;
  title: string;
  description: string | null;
  is_required: boolean;
  order_index: number;
  placeholder: string | null;
  validation_rules: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Join data
  options?: SurveyOption[];
}

export interface SurveyOption {
  id: string;
  question_id: string;
  text: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface SurveyStats {
  total: number;
  active: number;
  draft: number;
  closed: number;
  totalResponses: number;
}
