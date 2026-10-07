export interface StudentProfile {
  college?: string;
  degree?: string;
  branch?: string;
  academic_year?: string;
  cgpa?: number;
  graduation_year?: number;
  technical_skills: string[];
  soft_skills: string[];
  areas_of_interest: string[];
  career_goals?: string;
  preferred_categories: string[];
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  work_mode_preference?: string;
  preferred_radius_km?: number;
  onboarding_completed: boolean;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  profile: StudentProfile;
  created_at: string;
}

export interface EligibilityCriteria {
  eligible_degrees: string[];
  eligible_academic_years: string[];
  min_cgpa?: number | null;
  eligible_branches: string[];
  other_requirements?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  category: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  eligibility_criteria: EligibilityCriteria;
  location: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  work_mode: string;
  opening_date: string;
  deadline: string;
  official_url: string;
  source_url: string;
  source_name: string;
  publication_date: string;
  last_verified_date: string;
  verification_status: string;
  trust_score: number;
  verification_notes: string;
  opportunity_status: string;
  stipend_or_reward?: string;
  tags: string[];
  is_sample: boolean;
  
  // AI Recommendation enrichments
  match_score?: number;
  skills_match_score?: number;
  eligibility_status?: 'Eligible' | 'Potentially Eligible' | 'Not Eligible' | 'Eligibility Information Unavailable';
  eligibility_reasons?: string[];
  matched_skills?: string[];
  missing_skills?: string[];
  reasons?: string[];
  recommended_next_action?: string;
  days_remaining?: number;
  deadline_urgency?: 'red' | 'yellow' | 'green' | 'expired';
  is_saved?: boolean;
  is_applied?: boolean;
  current_application_status?: string;
}

export interface StatusHistoryEntry {
  status: string;
  changed_at: string;
  note?: string;
}

export interface Application {
  id: string;
  user_id: string;
  opportunity_id: string;
  opportunity?: Opportunity;
  status: string;
  notes: string;
  applied_date?: string;
  follow_up_date?: string;
  interview_date?: string;
  history: StatusHistoryEntry[];
  created_at: string;
  updated_at: string;
}

export interface SavedOpportunity {
  id: string;
  user_id: string;
  opportunity_id: string;
  opportunity?: Opportunity;
  priority: string;
  notes?: string;
  saved_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  opportunity_id?: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

export interface ActionItem {
  id: string;
  title: string;
  category: string;
  description: string;
  priority: 'urgent' | 'recommended' | 'optional';
  action_label: string;
  action_url: string;
  completed: boolean;
}

export interface DashboardStats {
  matched_opportunities_count: number;
  new_opportunities_count: number;
  applications_in_progress_count: number;
  upcoming_deadlines_count: number;
  saved_opportunities_count: number;
  closing_soon_count: number;
}

export interface AnalyticsData {
  stats: DashboardStats;
  applications_by_status: { status: string; count: number }[];
  opportunities_by_category: { category: string; count: number }[];
  top_in_demand_skills: { skill: string; count: number; user_has: boolean }[];
  weekly_activity: { day: string; applied: number; saved: number }[];
  match_distribution: { range: string; count: number }[];
}

export interface SkillGapItem {
  skill: string;
  priority: string;
  unlocked_count: number;
  description: string;
  resource_url: string;
  resource_type: string;
  estimated_hours: number;
  difficulty: string;
}

export interface SkillGapReport {
  matched_skills: string[];
  missing_skills: string[];
  frequent_market_skills: { skill: string; count: number; user_has: boolean; unlock_potential: string }[];
  recommended_learning_path: SkillGapItem[];
}

export interface SourceItem {
  id: string;
  name: string;
  type: string;
  base_url: string;
  is_active: boolean;
  last_sync?: string;
  sync_status: string;
  total_imported: number;
  error_log?: string;
}
