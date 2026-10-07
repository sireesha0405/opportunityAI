import {
  User,
  StudentProfile,
  Opportunity,
  Application,
  SavedOpportunity,
  NotificationItem,
  ActionItem,
  AnalyticsData,
  SkillGapReport,
  SourceItem
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('opportunityai_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'Request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (payload: { email: string; password: string; full_name: string }) =>
    request<{ access_token: string; token_type: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ access_token: string; token_type: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<User>('/auth/me'),

  forgotPassword: (email: string) =>
    request<{ message: string; status: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Profile
  getProfile: () => request<StudentProfile>('/profile'),

  updateProfile: (profile: Partial<StudentProfile>) =>
    request<User>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),

  // Opportunities
  listOpportunities: (params?: {
    category?: string;
    work_mode?: string;
    city?: string;
    eligibility?: string;
    urgency?: string;
    search?: string;
    source?: string;
    sort_by?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val && val !== 'All') searchParams.append(key, val);
      });
    }
    const qs = searchParams.toString();
    return request<Opportunity[]>(`/opportunities${qs ? `?${qs}` : ''}`);
  },

  getOpportunity: (id: string) => request<Opportunity>(`/opportunities/${id}`),

  syncUnstop: () =>
    request<{ status: string; synced_count: number; message: string }>('/opportunities/sync-unstop', {
      method: 'POST',
    }),

  seedOpportunities: () =>
    request<{ message: string; count: number }>('/opportunities/seed', { method: 'POST' }),

  searchNaturalLanguage: (query: string) =>
    request<{
      parsed_filters: Record<string, any>;
      detected_intent: string;
      total_found: number;
      results: Opportunity[];
    }>('/opportunities/search/nlp', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  // Recommendations & Dashboard
  getTopRecommendations: () => request<Opportunity[]>('/recommendations'),
  getUrgentOpportunities: () => request<Opportunity[]>('/recommendations/urgent'),
  getDailyActionPlan: () => request<ActionItem[]>('/recommendations/daily-action-plan'),

  // Interactive Map
  getMapOpportunities: (params?: {
    category?: string;
    city?: string;
    max_radius_km?: number;
    lat?: number;
    lon?: number;
    urgency?: string;
    include_expired?: boolean;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== 'All') {
          searchParams.append(key, String(val));
        }
      });
    }
    const qs = searchParams.toString();
    return request<Opportunity[]>(`/map/opportunities${qs ? `?${qs}` : ''}`);
  },

  // Applications
  listApplications: (params?: { status?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== 'All') searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    const qs = searchParams.toString();
    return request<Application[]>(`/applications${qs ? `?${qs}` : ''}`);
  },

  createApplication: (payload: {
    opportunity_id: string;
    status: string;
    notes?: string;
    applied_date?: string;
    follow_up_date?: string;
    interview_date?: string;
  }) =>
    request<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateApplication: (
    id: string,
    payload: {
      status?: string;
      notes?: string;
      applied_date?: string;
      follow_up_date?: string;
      interview_date?: string;
    }
  ) =>
    request<Application>(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteApplication: (id: string) =>
    request<{ status: string; message: string }>(`/applications/${id}`, { method: 'DELETE' }),

  // Saved Opportunities
  listSaved: () => request<SavedOpportunity[]>('/saved'),

  saveOpportunity: (opportunity_id: string, priority = 'medium', notes = '') =>
    request<SavedOpportunity>('/saved', {
      method: 'POST',
      body: JSON.stringify({ opportunity_id, priority, notes }),
    }),

  unsaveOpportunity: (opportunity_id: string) =>
    request<{ status: string; message: string }>(`/saved/${opportunity_id}`, { method: 'DELETE' }),

  // Notifications
  listNotifications: () => request<NotificationItem[]>('/notifications'),

  markNotificationRead: (id: string) =>
    request<{ status: string }>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: () =>
    request<{ status: string; message: string }>('/notifications/read-all', { method: 'POST' }),

  // Skills
  getSkillAnalysis: () => request<SkillGapReport>('/skills/analysis'),

  // Career Assistant Chat
  chatWithAssistant: (message: string) =>
    request<{ response: string; source: string; related_opportunities: string[] }>('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // Analytics
  getAnalytics: () => request<AnalyticsData>('/analytics'),

  // Sources & Trust
  listSources: () => request<SourceItem[]>('/sources'),
  syncSources: () => request<{ status: string; timestamp: string; sources_synced: number }>('/sources/sync', { method: 'POST' }),

  // Reports
  submitReport: (opportunity_id: string, reason: string, details: string) =>
    request<{ status: string; message: string; report_id: string }>('/reports', {
      method: 'POST',
      body: JSON.stringify({ opportunity_id, reason, details }),
    }),
};
