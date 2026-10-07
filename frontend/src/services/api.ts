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
  SourceItem,
} from '../types';
import { clientApi } from './clientApi';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('opportunityai_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function shouldFallback(err: any): boolean {
  if (!err) return true;
  if (err.message === 'BACKEND_UNAVAILABLE') return true;
  if (
    err.name === 'TypeError' ||
    err.message?.includes('Failed to fetch') ||
    err.message?.includes('NetworkError') ||
    err.message?.includes('Network request failed') ||
    err.message?.includes('Load failed')
  ) {
    return true;
  }
  if (err.status === 404 || err.status === 405 || err.status === 502 || err.status === 503 || err.status === 504) {
    return true;
  }
  return false;
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

  const contentType = response.headers.get('content-type') || '';
  // When running on static hosting (like Vercel), unknown /api requests get rewritten to index.html (text/html)
  if (!contentType.includes('application/json')) {
    throw new Error('BACKEND_UNAVAILABLE');
  }

  if (!response.ok) {
    let errorDetail = 'Request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    const err: any = new Error(errorDetail);
    err.status = response.status;
    throw err;
  }

  return response.json();
}

export const api = {
  // Authentication
  register: async (payload: { email: string; password: string; full_name: string }) => {
    try {
      return await request<{ access_token: string; token_type: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.register(payload);
      }
      throw err;
    }
  },

  login: async (payload: { email: string; password: string }) => {
    try {
      return await request<{ access_token: string; token_type: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.login(payload);
      }
      throw err;
    }
  },

  getMe: async () => {
    try {
      return await request<User>('/auth/me');
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.getMe();
      }
      throw err;
    }
  },

  forgotPassword: async (email: string) => {
    try {
      return await request<{ message: string; status: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.forgotPassword(email);
      }
      throw err;
    }
  },

  // Student Profile
  getProfile: async () => {
    try {
      return await request<StudentProfile>('/profile');
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.getProfile();
      }
      throw err;
    }
  },

  updateProfile: async (profile: Partial<StudentProfile>) => {
    try {
      return await request<User>('/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.updateProfile(profile);
      }
      throw err;
    }
  },

  // Opportunities
  listOpportunities: async (params?: {
    category?: string;
    work_mode?: string;
    city?: string;
    eligibility?: string;
    urgency?: string;
    search?: string;
    source?: string;
    sort_by?: string;
  }) => {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val && val !== 'All') searchParams.append(key, val);
        });
      }
      const qs = searchParams.toString();
      return await request<Opportunity[]>(`/opportunities${qs ? `?${qs}` : ''}`);
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.listOpportunities(params);
      }
      throw err;
    }
  },

  getOpportunity: async (id: string) => {
    try {
      return await request<Opportunity>(`/opportunities/${id}`);
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.getOpportunity(id);
      }
      throw err;
    }
  },

  syncUnstop: async () => {
    try {
      return await request<{ status: string; synced_count: number; message: string }>('/opportunities/sync-unstop', {
        method: 'POST',
      });
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.syncUnstop();
      }
      throw err;
    }
  },

  seedOpportunities: async () => {
    try {
      return await request<{ message: string; count: number }>('/opportunities/seed', { method: 'POST' });
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.seedOpportunities();
      }
      throw err;
    }
  },

  searchNaturalLanguage: async (query: string) => {
    try {
      return await request<{
        parsed_filters: Record<string, any>;
        detected_intent: string;
        total_found: number;
        results: Opportunity[];
      }>('/opportunities/search/nlp', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.searchNaturalLanguage(query);
      }
      throw err;
    }
  },

  // Recommendations & Dashboard
  getTopRecommendations: async () => {
    try {
      return await request<Opportunity[]>('/recommendations');
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.getTopRecommendations();
      }
      throw err;
    }
  },

  getUrgentOpportunities: async () => {
    try {
      return await request<Opportunity[]>('/recommendations/urgent');
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.getUrgentOpportunities();
      }
      throw err;
    }
  },

  getDailyActionPlan: async () => {
    try {
      return await request<ActionItem[]>('/recommendations/daily-action-plan');
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.getDailyActionPlan();
      }
      throw err;
    }
  },

  // Interactive Map
  getMapOpportunities: async (params?: {
    category?: string;
    city?: string;
    max_radius_km?: number;
    lat?: number;
    lon?: number;
    urgency?: string;
    include_expired?: boolean;
  }) => {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== 'All') {
            searchParams.append(key, String(val));
          }
        });
      }
      const qs = searchParams.toString();
      return await request<Opportunity[]>(`/map/opportunities${qs ? `?${qs}` : ''}`);
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.getMapOpportunities(params);
      }
      throw err;
    }
  },

  // Applications
  listApplications: async (params?: { status?: string; search?: string }) => {
    try {
      const searchParams = new URLSearchParams();
      if (params?.status && params.status !== 'All') searchParams.append('status', params.status);
      if (params?.search) searchParams.append('search', params.search);
      const qs = searchParams.toString();
      return await request<Application[]>(`/applications${qs ? `?${qs}` : ''}`);
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.listApplications(params);
      }
      throw err;
    }
  },

  createApplication: async (payload: {
    opportunity_id: string;
    status: string;
    notes?: string;
    applied_date?: string;
    follow_up_date?: string;
    interview_date?: string;
  }) => {
    try {
      return await request<Application>('/applications', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.createApplication(payload);
      }
      throw err;
    }
  },

  updateApplication: async (
    id: string,
    payload: {
      status?: string;
      notes?: string;
      applied_date?: string;
      follow_up_date?: string;
      interview_date?: string;
    }
  ) => {
    try {
      return await request<Application>(`/applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.updateApplication(id, payload);
      }
      throw err;
    }
  },

  deleteApplication: async (id: string) => {
    try {
      return await request<{ status: string; message: string }>(`/applications/${id}`, { method: 'DELETE' });
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.deleteApplication(id);
      }
      throw err;
    }
  },

  // Saved Opportunities
  listSaved: async () => {
    try {
      return await request<SavedOpportunity[]>('/saved');
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.listSaved();
      }
      throw err;
    }
  },

  saveOpportunity: async (opportunity_id: string, priority = 'medium', notes = '') => {
    try {
      return await request<SavedOpportunity>('/saved', {
        method: 'POST',
        body: JSON.stringify({ opportunity_id, priority, notes }),
      });
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.saveOpportunity(opportunity_id, priority, notes);
      }
      throw err;
    }
  },

  unsaveOpportunity: async (opportunity_id: string) => {
    try {
      return await request<{ status: string; message: string }>(`/saved/${opportunity_id}`, { method: 'DELETE' });
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.unsaveOpportunity(opportunity_id);
      }
      throw err;
    }
  },

  // Notifications
  listNotifications: async () => {
    try {
      return await request<NotificationItem[]>('/notifications');
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.listNotifications();
      }
      throw err;
    }
  },

  markNotificationRead: async (id: string) => {
    try {
      return await request<{ status: string }>(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.markNotificationRead(id);
      }
      throw err;
    }
  },

  markAllNotificationsRead: async () => {
    try {
      return await request<{ status: string; message: string }>('/notifications/read-all', { method: 'POST' });
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.markAllNotificationsRead();
      }
      throw err;
    }
  },

  // Skills
  getSkillAnalysis: async () => {
    try {
      return await request<SkillGapReport>('/skills/analysis');
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.getSkillAnalysis();
      }
      throw err;
    }
  },

  // Career Assistant Chat
  chatWithAssistant: async (message: string) => {
    try {
      return await request<{ response: string; source: string; related_opportunities: string[] }>('/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.chatWithAssistant(message);
      }
      throw err;
    }
  },

  // Analytics
  getAnalytics: async () => {
    try {
      return await request<AnalyticsData>('/analytics');
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.getAnalytics();
      }
      throw err;
    }
  },

  // Sources & Trust
  listSources: async () => {
    try {
      return await request<SourceItem[]>('/sources');
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.listSources();
      }
      throw err;
    }
  },

  syncSources: async () => {
    try {
      return await request<{ status: string; timestamp: string; sources_synced: number }>('/sources/sync', { method: 'POST' });
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.syncSources();
      }
      throw err;
    }
  },

  // Reports
  submitReport: async (opportunity_id: string, reason: string, details: string) => {
    try {
      return await request<{ status: string; message: string; report_id: string }>('/reports', {
        method: 'POST',
        body: JSON.stringify({ opportunity_id, reason, details }),
      });
    } catch (err: any) {
      if (shouldFallback(err)) {
        return await clientApi.submitReport(opportunity_id, reason, details);
      }
      throw err;
    }
  },
};
