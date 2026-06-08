export type SurveyStatus = 'draft' | 'published' | 'closed';
export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multiple_choice'
  | 'dropdown'
  | 'rating'
  | 'yes_no'
  | 'date'
  | 'number';

export interface SurveySettings {
  anonymous: boolean;
  one_response_per_participant: boolean;
}

export interface Survey {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  research_objective?: string | null;
  project_id?: string | null;
  survey_mode?: string | null;
  target_audience?: string | null;
  target_responses?: string | null;
  visibility?: 'Private' | 'Public' | 'Invite Only';
  estimated_duration?: string | null;
  research_category?: string | null;
  language?: string | null;
  research_timeline?: string | null;
  research_notes?: string | null;
  category: string | null;
  status: SurveyStatus;
  cover_image: string | null;
  estimated_time: number;
  tags: string[];
  settings?: SurveySettings;
  theme?: {
    color?: string;
    background?: string;
    font?: string;
  };
  config?: {
    color?: string;
    [key: string]: any;
  };
  badge?: {
    color?: string;
    text?: string;
  };
  analytics?: {
    color?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
  // Join data
  sections?: SurveySection[];
  questions?: SurveyQuestion[];
  response_count?: number;
}

export interface SurveySection {
  id: string;
  survey_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  // Join data
  questions?: SurveyQuestion[];
}

export interface SurveyQuestion {
  id: string;
  survey_id: string;
  section_id: string | null;
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
