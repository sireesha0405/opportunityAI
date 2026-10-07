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
import { MOCK_OPPORTUNITIES } from '../data/mockOpportunities';
import { MOCK_SOURCES } from '../data/mockSources';

export const DEMO_USER: User = {
  id: 'user-demo-student',
  email: 'demo.student@opportunityai.local',
  full_name: 'Aarav Sharma',
  is_active: true,
  profile: {
    college: 'Indian Institute of Information Technology',
    degree: 'B.Tech',
    branch: 'Computer Science and Engineering',
    academic_year: '3rd Year',
    cgpa: 8.6,
    graduation_year: 2027,
    technical_skills: ['Python', 'JavaScript', 'React', 'SQL', 'Git', 'Data Structures', 'Docker'],
    soft_skills: ['Problem Solving', 'Teamwork', 'Communication'],
    areas_of_interest: ['Artificial Intelligence', 'Web Development', 'Open Source'],
    career_goals: 'Seeking high-impact summer software engineering and AI internships.',
    preferred_categories: ['Internship', 'Hackathon', 'Fellowship'],
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.9716,
    longitude: 77.5946,
    work_mode_preference: 'Hybrid',
    preferred_radius_km: 50,
    onboarding_completed: true,
  },
  created_at: new Date().toISOString(),
};

// Storage keys
const STORAGE_KEYS = {
  CURRENT_USER: 'opportunityai_current_user',
  TOKEN: 'opportunityai_token',
  REGISTERED_USERS: 'opportunityai_registered_users',
  APPLICATIONS: 'opportunityai_applications',
  SAVED: 'opportunityai_saved',
  NOTIFICATIONS: 'opportunityai_notifications',
};

interface StoredAccount {
  user: User;
  passwordHash: string;
}

function getStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStoredAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(accounts));
}

export function getClientCurrentUser(): User {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEMO_USER;
}

export function setClientCurrentUser(user: User) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

// Stored applications
function getClientApplications(): Application[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (raw) return JSON.parse(raw);
  } catch {}

  const defaults: Application[] = [
    {
      id: 'app-default-1',
      user_id: DEMO_USER.id,
      opportunity_id: 'opp-gsoc-2026',
      status: 'Applied',
      notes: 'Submitted proposal draft to the open-source organization mentor.',
      applied_date: new Date(Date.now() - 3 * 86400000).toISOString(),
      follow_up_date: new Date(Date.now() + 5 * 86400000).toISOString(),
      history: [
        {
          status: 'Applied',
          changed_at: new Date(Date.now() - 3 * 86400000).toISOString(),
          note: 'Application submitted',
        },
      ],
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'app-default-2',
      user_id: DEMO_USER.id,
      opportunity_id: 'opp-aws-cloud-intern',
      status: 'Interviewing',
      notes: 'Completed OA and behavioral rounds; final technical interview scheduled.',
      applied_date: new Date(Date.now() - 10 * 86400000).toISOString(),
      interview_date: new Date(Date.now() + 2 * 86400000).toISOString(),
      history: [
        {
          status: 'Applied',
          changed_at: new Date(Date.now() - 10 * 86400000).toISOString(),
          note: 'Applied on Amazon Student Careers',
        },
        {
          status: 'Interviewing',
          changed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          note: 'Invited to final technical rounds',
        },
      ],
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'app-default-3',
      user_id: DEMO_USER.id,
      opportunity_id: 'opp-sih-2026',
      status: 'Shortlisted',
      notes: 'College internal hackathon team selection confirmed.',
      applied_date: new Date(Date.now() - 5 * 86400000).toISOString(),
      history: [
        {
          status: 'Applied',
          changed_at: new Date(Date.now() - 5 * 86400000).toISOString(),
          note: 'SIH registration submitted',
        },
        {
          status: 'Shortlisted',
          changed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
          note: 'Selected for college team nomination',
        },
      ],
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ];

  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(defaults));
  return defaults;
}

function saveClientApplications(apps: Application[]) {
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
}

// Stored saved opportunities
function getClientSaved(): SavedOpportunity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED);
    if (raw) return JSON.parse(raw);
  } catch {}

  const defaults: SavedOpportunity[] = [
    {
      id: 'saved-1',
      user_id: DEMO_USER.id,
      opportunity_id: 'opp-msft-ai-fellowship',
      priority: 'high',
      notes: 'Prepare GitHub portfolio projects before applying.',
      saved_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'saved-2',
      user_id: DEMO_USER.id,
      opportunity_id: 'opp-reliance-scholarship',
      priority: 'medium',
      notes: 'Requires college recommendation letter and transcript.',
      saved_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
  ];

  localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(defaults));
  return defaults;
}

function saveClientSaved(saved: SavedOpportunity[]) {
  localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(saved));
}

// Recommendation & Eligibility Calculator
export function enrichOpportunity(
  opp: Opportunity,
  profile: StudentProfile,
  savedIds: Set<string>,
  appliedMap: Map<string, Application>
): Opportunity {
  const now = Date.now();
  const deadlineMs = new Date(opp.deadline).getTime();
  const daysDiff = Math.ceil((deadlineMs - now) / (1000 * 60 * 60 * 24));
  const days_remaining = isNaN(daysDiff) ? 14 : daysDiff;

  let deadline_urgency: 'red' | 'yellow' | 'green' | 'expired' = 'green';
  if (days_remaining < 0) deadline_urgency = 'expired';
  else if (days_remaining <= 3) deadline_urgency = 'red';
  else if (days_remaining <= 14) deadline_urgency = 'yellow';

  // Eligibility
  const crit = opp.eligibility_criteria || {
    eligible_degrees: ['All'],
    eligible_academic_years: ['All'],
    eligible_branches: ['All'],
  };

  const eligibleDegrees = (crit.eligible_degrees || []).map((d) => d.toLowerCase());
  const eligibleYears = (crit.eligible_academic_years || []).map((y) => y.toLowerCase());
  const eligibleBranches = (crit.eligible_branches || []).map((b) => b.toLowerCase());
  const minCgpa = crit.min_cgpa;

  const userDegree = (profile.degree || '').toLowerCase();
  const userYear = (profile.academic_year || '').toLowerCase();
  const userBranch = (profile.branch || '').toLowerCase();
  const userCgpa = profile.cgpa ?? 8.0;

  let degreeMatch =
    eligibleDegrees.length === 0 ||
    eligibleDegrees.includes('all') ||
    eligibleDegrees.some((d) => userDegree.includes(d) || d.includes(userDegree));

  let yearMatch =
    eligibleYears.length === 0 ||
    eligibleYears.includes('all') ||
    eligibleYears.some((y) => userYear.includes(y) || y.includes(userYear));

  let branchMatch =
    eligibleBranches.length === 0 ||
    eligibleBranches.includes('all') ||
    eligibleBranches.some((b) => userBranch.includes(b) || b.includes(userBranch));

  let cgpaMatch = minCgpa == null || userCgpa >= minCgpa;

  let eligibility_status: Opportunity['eligibility_status'] = 'Eligible';
  const eligibility_reasons: string[] = [];

  if (degreeMatch && yearMatch && cgpaMatch && branchMatch) {
    eligibility_status = 'Eligible';
    eligibility_reasons.push('You fulfill all degree, academic year, and branch requirements.');
    if (minCgpa) eligibility_reasons.push(`Your CGPA (${userCgpa}) meets the minimum of ${minCgpa}.`);
  } else if (!degreeMatch || !yearMatch) {
    eligibility_status = 'Not Eligible';
    if (!degreeMatch) eligibility_reasons.push(`Requires degrees: ${crit.eligible_degrees.join(', ')}.`);
    if (!yearMatch) eligibility_reasons.push(`Eligible years: ${crit.eligible_academic_years.join(', ')}.`);
  } else {
    eligibility_status = 'Potentially Eligible';
    if (!cgpaMatch) eligibility_reasons.push(`Requires minimum CGPA of ${minCgpa} (current: ${userCgpa}).`);
    if (!branchMatch) eligibility_reasons.push(`Target branches: ${crit.eligible_branches.join(', ')}.`);
  }

  // Skills Match
  const userSkills = new Set(
    [...(profile.technical_skills || []), ...(profile.soft_skills || [])].map((s) => s.toLowerCase().trim())
  );

  const reqSkills = opp.required_skills || [];
  const prefSkills = opp.preferred_skills || [];

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  reqSkills.forEach((s) => {
    if (userSkills.has(s.toLowerCase().trim())) matchedSkills.push(s);
    else missingSkills.push(s);
  });

  prefSkills.forEach((s) => {
    if (userSkills.has(s.toLowerCase().trim()) && !matchedSkills.includes(s)) matchedSkills.push(s);
  });

  const totalSkills = Math.max(reqSkills.length, 1);
  const skillsRatio = Math.min(matchedSkills.length / totalSkills, 1.0);
  const skills_match_score = Math.round(skillsRatio * 100);

  // Total match score (35% skills, 25% eligibility, 15% category, 15% workmode, 10% deadline)
  let baseScore = skillsRatio * 35;
  if (eligibility_status === 'Eligible') baseScore += 25;
  else if (eligibility_status === 'Potentially Eligible') baseScore += 15;

  const prefCategories = (profile.preferred_categories || []).map((c) => c.toLowerCase());
  if (prefCategories.includes(opp.category.toLowerCase())) baseScore += 15;

  if (
    !profile.work_mode_preference ||
    profile.work_mode_preference.toLowerCase() === 'any' ||
    profile.work_mode_preference.toLowerCase() === opp.work_mode.toLowerCase() ||
    opp.work_mode.toLowerCase() === 'remote'
  ) {
    baseScore += 15;
  }

  if (deadline_urgency === 'red') baseScore += 10;
  else if (deadline_urgency === 'yellow') baseScore += 7;
  else baseScore += 4;

  const match_score = Math.min(Math.max(Math.round(baseScore), 40), 99);

  const is_saved = savedIds.has(opp.id);
  const is_applied = appliedMap.has(opp.id);
  const current_application_status = appliedMap.get(opp.id)?.status;

  return {
    ...opp,
    days_remaining,
    deadline_urgency,
    eligibility_status,
    eligibility_reasons,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    skills_match_score,
    match_score,
    is_saved,
    is_applied,
    current_application_status,
  };
}

function getAllEnrichedOpportunities(currentUser?: User): Opportunity[] {
  const user = currentUser || getClientCurrentUser();
  const savedList = getClientSaved();
  const savedIds = new Set(savedList.map((s) => s.opportunity_id));
  const appList = getClientApplications();
  const appMap = new Map<string, Application>();
  appList.forEach((a) => appMap.set(a.opportunity_id, a));

  return MOCK_OPPORTUNITIES.map((opp) => enrichOpportunity(opp, user.profile, savedIds, appMap));
}

// ---------------------------------------------------------------------------
// Client API implementation
// ---------------------------------------------------------------------------

export const clientApi = {
  // Authentication
  async register(payload: { email: string; password: string; full_name: string }): Promise<{
    access_token: string;
    token_type: string;
    user: User;
  }> {
    const cleanEmail = payload.email.trim().toLowerCase();
    const accounts = getStoredAccounts();

    if (
      accounts.some((a) => a.user.email.toLowerCase() === cleanEmail) ||
      cleanEmail === DEMO_USER.email.toLowerCase()
    ) {
      throw new Error('A user with this email address already exists. Please sign in.');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      full_name: payload.full_name.trim(),
      is_active: true,
      profile: {
        college: 'National University',
        degree: 'B.Tech',
        branch: 'Computer Science and Engineering',
        academic_year: '3rd Year',
        cgpa: 8.5,
        graduation_year: 2027,
        technical_skills: ['Python', 'JavaScript', 'React', 'SQL', 'Git'],
        soft_skills: ['Problem Solving', 'Communication', 'Teamwork'],
        areas_of_interest: ['Artificial Intelligence', 'Web Development'],
        career_goals: 'Seeking top internships and hackathons to build real-world software.',
        preferred_categories: ['Internship', 'Hackathon'],
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        latitude: 12.9716,
        longitude: 77.5946,
        work_mode_preference: 'Hybrid',
        preferred_radius_km: 50,
        onboarding_completed: true,
      },
      created_at: new Date().toISOString(),
    };

    accounts.push({
      user: newUser,
      passwordHash: payload.password,
    });
    saveStoredAccounts(accounts);
    setClientCurrentUser(newUser);

    const token = `token-${newUser.id}`;
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);

    return {
      access_token: token,
      token_type: 'bearer',
      user: newUser,
    };
  },

  async login(payload: { email: string; password: string }): Promise<{
    access_token: string;
    token_type: string;
    user: User;
  }> {
    const cleanEmail = payload.email.trim().toLowerCase();

    // Check demo user credentials
    if (
      cleanEmail === DEMO_USER.email.toLowerCase() ||
      (cleanEmail.includes('demo') && payload.password.includes('Demo'))
    ) {
      setClientCurrentUser(DEMO_USER);
      const token = 'token-demo-student';
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      return {
        access_token: token,
        token_type: 'bearer',
        user: DEMO_USER,
      };
    }

    // Check stored accounts
    const accounts = getStoredAccounts();
    const found = accounts.find((a) => a.user.email.toLowerCase() === cleanEmail);

    if (found) {
      if (found.passwordHash !== payload.password) {
        throw new Error('Invalid email or password.');
      }
      setClientCurrentUser(found.user);
      const token = `token-${found.user.id}`;
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      return {
        access_token: token,
        token_type: 'bearer',
        user: found.user,
      };
    }

    // If not found, check if student wants instant account or typed valid email
    throw new Error('Account not found with this email. Please switch to Register to create your student account.');
  },

  async getMe(): Promise<User> {
    return getClientCurrentUser();
  },

  async forgotPassword(email: string): Promise<{ message: string; status: string }> {
    return {
      message: `Password reset instructions have been sent to ${email} if an account exists.`,
      status: 'success',
    };
  },

  // Student Profile
  async getProfile(): Promise<StudentProfile> {
    return getClientCurrentUser().profile;
  },

  async updateProfile(profileUpdate: Partial<StudentProfile>): Promise<User> {
    const user = getClientCurrentUser();
    const updatedUser: User = {
      ...user,
      profile: {
        ...user.profile,
        ...profileUpdate,
      },
    };
    setClientCurrentUser(updatedUser);

    // Also update in registered users list if present
    const accounts = getStoredAccounts();
    const idx = accounts.findIndex((a) => a.user.id === user.id);
    if (idx !== -1) {
      accounts[idx].user = updatedUser;
      saveStoredAccounts(accounts);
    }

    return updatedUser;
  },

  // Opportunities
  async listOpportunities(params?: {
    category?: string;
    work_mode?: string;
    city?: string;
    eligibility?: string;
    urgency?: string;
    search?: string;
    source?: string;
    sort_by?: string;
  }): Promise<Opportunity[]> {
    let list = getAllEnrichedOpportunities();

    if (params?.category && params.category !== 'All') {
      list = list.filter((o) => o.category.toLowerCase() === params.category!.toLowerCase());
    }

    if (params?.work_mode && params.work_mode !== 'All') {
      list = list.filter((o) => o.work_mode.toLowerCase() === params.work_mode!.toLowerCase());
    }

    if (params?.city && params.city !== 'All') {
      list = list.filter((o) => (o.city || '').toLowerCase().includes(params.city!.toLowerCase()));
    }

    if (params?.eligibility && params.eligibility !== 'All') {
      list = list.filter((o) => o.eligibility_status === params.eligibility);
    }

    if (params?.urgency && params.urgency !== 'All') {
      list = list.filter((o) => o.deadline_urgency === params.urgency);
    }

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.organization.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          (o.tags || []).some((t) => t.toLowerCase().includes(q)) ||
          (o.required_skills || []).some((s) => s.toLowerCase().includes(q))
      );
    }

    if (params?.source && params.source !== 'All') {
      list = list.filter((o) => (o.source_name || '').toLowerCase().includes(params.source!.toLowerCase()));
    }

    if (params?.sort_by === 'deadline') {
      list.sort((a, b) => (a.days_remaining ?? 999) - (b.days_remaining ?? 999));
    } else {
      // Default: sort by match score descending
      list.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
    }

    return list;
  },

  async getOpportunity(id: string): Promise<Opportunity> {
    const list = getAllEnrichedOpportunities();
    const found = list.find((o) => o.id === id);
    if (!found) throw new Error('Opportunity not found');
    return found;
  },

  async syncUnstop(): Promise<{ status: string; synced_count: number; message: string }> {
    return {
      status: 'success',
      synced_count: 9,
      message: 'Successfully refreshed official verified feeds from Unstop and partner portals.',
    };
  },

  async seedOpportunities(): Promise<{ message: string; count: number }> {
    return {
      message: 'Opportunities successfully seeded.',
      count: MOCK_OPPORTUNITIES.length,
    };
  },

  async searchNaturalLanguage(query: string): Promise<{
    parsed_filters: Record<string, any>;
    detected_intent: string;
    total_found: number;
    results: Opportunity[];
  }> {
    const q = query.toLowerCase();
    const all = getAllEnrichedOpportunities();

    const results = all.filter((o) => {
      if (q.includes('intern') && o.category.toLowerCase() === 'internship') return true;
      if (q.includes('hackathon') && o.category.toLowerCase() === 'hackathon') return true;
      if (q.includes('scholarship') && o.category.toLowerCase() === 'scholarship') return true;
      if (q.includes('remote') && o.work_mode.toLowerCase() === 'remote') return true;
      if (q.includes('urgent') && (o.days_remaining ?? 99) <= 3) return true;
      if (q.includes('python') && (o.required_skills || []).some((s) => s.toLowerCase().includes('python'))) return true;
      if (q.includes('ai') && (o.tags || []).some((t) => t.toLowerCase().includes('ai'))) return true;

      return (
        o.title.toLowerCase().includes(q) ||
        o.organization.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q)
      );
    });

    return {
      parsed_filters: { query },
      detected_intent: 'Smart semantic career discovery',
      total_found: results.length,
      results: results.slice(0, 10),
    };
  },

  // Recommendations & Dashboard
  async getTopRecommendations(): Promise<Opportunity[]> {
    const all = getAllEnrichedOpportunities();
    return all.filter((o) => (o.match_score ?? 0) >= 60).slice(0, 8);
  },

  async getUrgentOpportunities(): Promise<Opportunity[]> {
    const all = getAllEnrichedOpportunities();
    return all
      .filter((o) => (o.days_remaining ?? 99) > 0 && (o.days_remaining ?? 99) <= 3)
      .sort((a, b) => (a.days_remaining ?? 0) - (b.days_remaining ?? 0));
  },

  async getDailyActionPlan(): Promise<ActionItem[]> {
    const urgent = await this.getUrgentOpportunities();
    const apps = getClientApplications();
    const pendingApps = apps.filter((a) => a.status === 'Applied' || a.status === 'Interviewing');

    const items: ActionItem[] = [
      {
        id: 'act-1',
        title: `Submit Application for ${urgent[0]?.title || 'Google Summer of Code (GSoC)'}`,
        category: 'Urgent Deadline',
        description: `This high-match opening closes in ${urgent[0]?.days_remaining || 3} days. Finalize your proposal.`,
        priority: 'urgent',
        action_label: 'View Listing',
        action_url: `/explore`,
        completed: false,
      },
      {
        id: 'act-2',
        title: `Follow up on ${pendingApps[0]?.opportunity_id || 'AWS Cloud'} Application`,
        category: 'Application Follow-Up',
        description: 'Check portal status and review core system design concepts.',
        priority: 'recommended',
        action_label: 'Open Pipeline',
        action_url: '/applications',
        completed: false,
      },
      {
        id: 'act-3',
        title: 'Complete Docker & Containerization Skill Badge',
        category: 'Targeted Skill Upskilling',
        description: 'Docker is required by 68% of your top-matched software engineering openings.',
        priority: 'recommended',
        action_label: 'View Skill Gap',
        action_url: '/skills',
        completed: false,
      },
    ];

    return items;
  },

  // Interactive Map
  async getMapOpportunities(params?: {
    category?: string;
    city?: string;
    max_radius_km?: number;
    lat?: number;
    lon?: number;
    urgency?: string;
    include_expired?: boolean;
  }): Promise<Opportunity[]> {
    let list = getAllEnrichedOpportunities().filter((o) => o.latitude != null && o.longitude != null);

    if (params?.category && params.category !== 'All') {
      list = list.filter((o) => o.category.toLowerCase() === params.category!.toLowerCase());
    }

    if (params?.city && params.city !== 'All') {
      list = list.filter((o) => (o.city || '').toLowerCase().includes(params.city!.toLowerCase()));
    }

    if (params?.urgency && params.urgency !== 'All') {
      list = list.filter((o) => o.deadline_urgency === params.urgency);
    }

    return list;
  },

  // Applications
  async listApplications(params?: { status?: string; search?: string }): Promise<Application[]> {
    let apps = getClientApplications();
    const allOpps = getAllEnrichedOpportunities();
    const oppMap = new Map(allOpps.map((o) => [o.id, o]));

    // Attach opportunity details
    apps = apps.map((app) => ({
      ...app,
      opportunity: oppMap.get(app.opportunity_id),
    }));

    if (params?.status && params.status !== 'All') {
      apps = apps.filter((a) => a.status.toLowerCase() === params.status!.toLowerCase());
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      apps = apps.filter(
        (a) =>
          a.notes.toLowerCase().includes(q) ||
          a.opportunity?.title.toLowerCase().includes(q) ||
          a.opportunity?.organization.toLowerCase().includes(q)
      );
    }

    return apps;
  },

  async createApplication(payload: {
    opportunity_id: string;
    status: string;
    notes?: string;
    applied_date?: string;
    follow_up_date?: string;
    interview_date?: string;
  }): Promise<Application> {
    const apps = getClientApplications();
    const user = getClientCurrentUser();
    const allOpps = getAllEnrichedOpportunities();
    const opp = allOpps.find((o) => o.id === payload.opportunity_id);

    const newApp: Application = {
      id: `app-${Date.now()}`,
      user_id: user.id,
      opportunity_id: payload.opportunity_id,
      opportunity: opp,
      status: payload.status,
      notes: payload.notes || '',
      applied_date: payload.applied_date || new Date().toISOString(),
      follow_up_date: payload.follow_up_date,
      interview_date: payload.interview_date,
      history: [
        {
          status: payload.status,
          changed_at: new Date().toISOString(),
          note: 'Application created',
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    apps.unshift(newApp);
    saveClientApplications(apps);
    return newApp;
  },

  async updateApplication(
    id: string,
    payload: {
      status?: string;
      notes?: string;
      applied_date?: string;
      follow_up_date?: string;
      interview_date?: string;
    }
  ): Promise<Application> {
    const apps = getClientApplications();
    const idx = apps.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Application not found');

    const app = apps[idx];
    const newStatus = payload.status || app.status;
    const history = [...app.history];

    if (payload.status && payload.status !== app.status) {
      history.push({
        status: payload.status,
        changed_at: new Date().toISOString(),
        note: payload.notes ? `Status changed to ${payload.status}: ${payload.notes}` : `Status changed to ${payload.status}`,
      });
    }

    const updated: Application = {
      ...app,
      ...payload,
      status: newStatus,
      history,
      updated_at: new Date().toISOString(),
    };

    apps[idx] = updated;
    saveClientApplications(apps);
    return updated;
  },

  async deleteApplication(id: string): Promise<{ status: string; message: string }> {
    let apps = getClientApplications();
    apps = apps.filter((a) => a.id !== id);
    saveClientApplications(apps);
    return { status: 'success', message: 'Application deleted.' };
  },

  // Saved Opportunities
  async listSaved(): Promise<SavedOpportunity[]> {
    const saved = getClientSaved();
    const allOpps = getAllEnrichedOpportunities();
    const oppMap = new Map(allOpps.map((o) => [o.id, o]));

    return saved.map((s) => ({
      ...s,
      opportunity: oppMap.get(s.opportunity_id),
    }));
  },

  async saveOpportunity(opportunity_id: string, priority = 'medium', notes = ''): Promise<SavedOpportunity> {
    const saved = getClientSaved();
    const user = getClientCurrentUser();
    const existing = saved.find((s) => s.opportunity_id === opportunity_id);
    if (existing) return existing;

    const newSaved: SavedOpportunity = {
      id: `saved-${Date.now()}`,
      user_id: user.id,
      opportunity_id,
      priority,
      notes,
      saved_at: new Date().toISOString(),
    };

    saved.unshift(newSaved);
    saveClientSaved(saved);
    return newSaved;
  },

  async unsaveOpportunity(opportunity_id: string): Promise<{ status: string; message: string }> {
    let saved = getClientSaved();
    saved = saved.filter((s) => s.opportunity_id !== opportunity_id);
    saveClientSaved(saved);
    return { status: 'success', message: 'Bookmark removed.' };
  },

  // Notifications
  async listNotifications(): Promise<NotificationItem[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (raw) return JSON.parse(raw);
    } catch {}

    const urgent = await this.getUrgentOpportunities();
    const defaults: NotificationItem[] = [
      {
        id: 'notif-1',
        user_id: DEMO_USER.id,
        title: '⚠️ Urgent Deadline Approaching',
        message: `${urgent[0]?.title || 'Google Summer of Code'} closes in 3 days. Complete submission today.`,
        type: 'deadline_warning',
        opportunity_id: urgent[0]?.id || 'opp-gsoc-2026',
        is_read: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'notif-2',
        user_id: DEMO_USER.id,
        title: '✨ 95% High Match Detected',
        message: 'A new cloud solutions architecture internship matching your skills was added.',
        type: 'new_match',
        opportunity_id: 'opp-aws-cloud-intern',
        is_read: false,
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'notif-3',
        user_id: DEMO_USER.id,
        title: '📋 Follow-up Scheduled',
        message: 'Reminder to follow up on your AWS internship application this week.',
        type: 'application_update',
        is_read: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaults));
    return defaults;
  },

  async markNotificationRead(id: string): Promise<{ status: string }> {
    const list = await this.listNotifications();
    const idx = list.findIndex((n) => n.id === id);
    if (idx !== -1) {
      list[idx].is_read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    }
    return { status: 'success' };
  },

  async markAllNotificationsRead(): Promise<{ status: string; message: string }> {
    const list = await this.listNotifications();
    list.forEach((n) => (n.is_read = true));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    return { status: 'success', message: 'All notifications marked as read.' };
  },

  // Skills Gap
  async getSkillAnalysis(): Promise<SkillGapReport> {
    const user = getClientCurrentUser();
    const userSkills = new Set(
      [...(user.profile.technical_skills || []), ...(user.profile.soft_skills || [])].map((s) => s.toLowerCase())
    );

    const frequentSkills = [
      { skill: 'Docker & Containers', count: 18, user_has: userSkills.has('docker'), unlock_potential: '+22% Match Lift' },
      { skill: 'AWS Cloud Services', count: 16, user_has: userSkills.has('aws'), unlock_potential: '+19% Match Lift' },
      { skill: 'Python', count: 21, user_has: userSkills.has('python'), unlock_potential: '+35% Core Match' },
      { skill: 'System Design & APIs', count: 14, user_has: userSkills.has('api design') || userSkills.has('system design'), unlock_potential: '+15% Match Lift' },
      { skill: 'TypeScript / React', count: 15, user_has: userSkills.has('react') || userSkills.has('typescript'), unlock_potential: '+25% Web Match' },
      { skill: 'Git & Open Source Workflow', count: 20, user_has: userSkills.has('git'), unlock_potential: '+20% Core Match' },
    ];

    const learningPath = [
      {
        skill: 'Docker & Containerization',
        priority: 'High Priority',
        unlocked_count: 7,
        description: 'Containerize backend applications, create multi-stage Dockerfiles, and manage microservices.',
        resource_url: 'https://docs.docker.com/get-started/',
        resource_type: 'Interactive Documentation & Labs',
        estimated_hours: 8,
        difficulty: 'Intermediate',
      },
      {
        skill: 'AWS Cloud Architecture Fundamentals',
        priority: 'High Priority',
        unlocked_count: 5,
        description: 'Master Amazon S3, EC2, Lambda serverless, and IAM permissions for enterprise applications.',
        resource_url: 'https://aws.amazon.com/training/',
        resource_type: 'Free Digital Courses',
        estimated_hours: 12,
        difficulty: 'Intermediate',
      },
      {
        skill: 'System Design & REST/GraphQL API Design',
        priority: 'Medium Priority',
        unlocked_count: 4,
        description: 'Learn database indexing, caching strategies, rate limiting, and scalable backend architecture.',
        resource_url: 'https://github.com/donnemartin/system-design-primer',
        resource_type: 'Open Source Handbook',
        estimated_hours: 15,
        difficulty: 'Advanced',
      },
    ];

    return {
      matched_skills: user.profile.technical_skills || ['Python', 'React', 'SQL', 'Git'],
      missing_skills: ['Docker', 'AWS', 'Kubernetes', 'FastAPI Production'],
      frequent_market_skills: frequentSkills,
      recommended_learning_path: learningPath,
    };
  },

  // Career Assistant Chat
  async chatWithAssistant(message: string): Promise<{
    response: string;
    source: string;
    related_opportunities: string[];
  }> {
    const q = message.toLowerCase();
    let reply = '';

    if (q.includes('gsoc') || q.includes('open source')) {
      reply = `**Google Summer of Code (GSoC) Strategy:**\n\n1. **Select an Organization Now:** Filter organizations on the official GSoC archive that align with your stack (Python/JavaScript).\n2. **Engage with the Community:** Join their Discord/IRC or mailing list. Introduce yourself politely and mention your interest in good-first-issues.\n3. **Submit 1-2 Pull Requests:** Before submitting your proposal, having merged or reviewed PRs dramatically raises your acceptance chance.\n4. **Proposal Structure:** Include background, detailed 12-week timeline with deliverable milestones, and buffer weeks for testing.`;
    } else if (q.includes('resume') || q.includes('ats')) {
      reply = `**ATS Resume Optimization for Students:**\n\n1. **Use Single-Column Layout:** Tables and multi-column graphics confuse standard ATS parsers.\n2. **Quantify Impact (STAR Method):** Rather than "Built a dashboard", write: *"Engineered a real-time analytics dashboard with React & Vite, reducing render latency by 45% for 1,200+ daily student users."*\n3. **Include Core Skills Section:** Group into Languages (Python, TypeScript, SQL), Frameworks (React, FastAPI), and Tools (Docker, Git, AWS).\n4. **Tailor Keywords:** Ensure keywords from the specific job description appear organically in your experience descriptions.`;
    } else if (q.includes('interview') || q.includes('prep')) {
      reply = `**Technical Interview Preparation Roadmap:**\n\n- **Data Structures & Algorithms:** Focus on Arrays, Hash Maps, Two Pointers, Trees, and Graph BFS/DFS.\n- **Mock Behavioral Questions:** Prepare 3 stories demonstrating ownership, technical conflict resolution, and working under deadlines.\n- **Ask Insightful Questions:** At the end of the interview, ask about tech stack scaling challenges, mentoring structure, and recent engineering breakthroughs.`;
    } else {
      reply = `Hello! I am your **OpportunityAI Career Assistant**.\n\nBased on your student profile, here are high-impact steps you can take today:\n- Review **Google Summer of Code (GSoC 2026)** and **AWS Cloud Intern**, which match your technical background.\n- Complete your application follow-ups in the **Kanban Pipeline**.\n- You can ask me for resume advice, interview questions, or hackathon project ideation anytime!`;
    }

    return {
      response: reply,
      source: 'OpportunityAI Career Intelligence',
      related_opportunities: ['opp-gsoc-2026', 'opp-aws-cloud-intern'],
    };
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    const opps = getAllEnrichedOpportunities();
    const apps = getClientApplications();
    const saved = getClientSaved();

    const matched = opps.filter((o) => (o.match_score ?? 0) >= 60).length;
    const closingSoon = opps.filter((o) => (o.days_remaining ?? 99) > 0 && (o.days_remaining ?? 99) <= 14).length;
    const urgent = opps.filter((o) => (o.days_remaining ?? 99) > 0 && (o.days_remaining ?? 99) <= 3).length;

    const statusCounts: Record<string, number> = {
      Saved: 0,
      Applied: 0,
      Interviewing: 0,
      Offer: 0,
      Rejected: 0,
    };
    apps.forEach((a) => {
      const s = a.status || 'Applied';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    const categoryCounts: Record<string, number> = {};
    opps.forEach((o) => {
      categoryCounts[o.category] = (categoryCounts[o.category] || 0) + 1;
    });

    return {
      stats: {
        matched_opportunities_count: matched,
        new_opportunities_count: opps.length,
        applications_in_progress_count: apps.length,
        upcoming_deadlines_count: urgent,
        saved_opportunities_count: saved.length,
        closing_soon_count: closingSoon,
      },
      applications_by_status: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
      opportunities_by_category: Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count,
      })),
      top_in_demand_skills: [
        { skill: 'Python', count: 18, user_has: true },
        { skill: 'React', count: 14, user_has: true },
        { skill: 'Docker', count: 12, user_has: false },
        { skill: 'AWS', count: 11, user_has: false },
        { skill: 'SQL', count: 10, user_has: true },
        { skill: 'Git', count: 16, user_has: true },
      ],
      weekly_activity: [
        { day: 'Mon', applied: 1, saved: 2 },
        { day: 'Tue', applied: 0, saved: 1 },
        { day: 'Wed', applied: 2, saved: 0 },
        { day: 'Thu', applied: 1, saved: 3 },
        { day: 'Fri', applied: 0, saved: 1 },
        { day: 'Sat', applied: 1, saved: 2 },
        { day: 'Sun', applied: 0, saved: 0 },
      ],
      match_distribution: [
        { range: '90-100%', count: 4 },
        { range: '80-89%', count: 8 },
        { range: '70-79%', count: 6 },
        { range: '60-69%', count: 3 },
        { range: '<60%', count: 2 },
      ],
    };
  },

  // Sources
  async listSources(): Promise<SourceItem[]> {
    return MOCK_SOURCES;
  },

  async syncSources(): Promise<{ status: string; timestamp: string; sources_synced: number }> {
    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      sources_synced: MOCK_SOURCES.length,
    };
  },

  // Report
  async submitReport(
    opportunity_id: string,
    reason: string,
    details: string
  ): Promise<{ status: string; message: string; report_id: string }> {
    return {
      status: 'success',
      message: 'Thank you for keeping OpportunityAI verified. Our trust and safety team will inspect this listing.',
      report_id: `rep-${Date.now()}`,
    };
  },
};
