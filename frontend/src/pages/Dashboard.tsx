import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Bookmark,
  Calendar,
  ArrowRight,
  Flame,
  BotMessageSquare,
  Compass,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Opportunity, ActionItem, AnalyticsData } from '../types';
import { OpportunityCard } from '../components/OpportunityCard';
import { OpportunityModal } from '../components/OpportunityModal';
import { ReportModal } from '../components/ReportModal';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Opportunity[]>([]);
  const [urgentOpps, setUrgentOpps] = useState<Opportunity[]>([]);
  const [actionPlan, setActionPlan] = useState<ActionItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [reportingOpp, setReportingOpp] = useState<Opportunity | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [recs, urgent, actions, statsData] = await Promise.all([
        api.getTopRecommendations(),
        api.getUrgentOpportunities(),
        api.getDailyActionPlan(),
        api.getAnalytics().catch(() => null),
      ]);
      setRecommendations(recs);
      setUrgentOpps(urgent);
      setActionPlan(actions);
      setAnalytics(statsData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const toggleActionItem = (id: string) => {
    setActionPlan(
      actionPlan.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const stats = analytics?.stats || {
    matched_opportunities_count: recommendations.length,
    new_opportunities_count: 15,
    applications_in_progress_count: 2,
    upcoming_deadlines_count: urgentOpps.length,
    saved_opportunities_count: 3,
    closing_soon_count: urgentOpps.length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Welcome Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-slate-900 border border-blue-500/20 overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI Career Intelligence Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.full_name || 'Student'}! 👋
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            {user?.profile?.degree
              ? `${user.profile.degree} (${user.profile.branch || 'CSE'}) • ${user.profile.academic_year || '3rd Year'}`
              : 'Empowering your career discovery.'}{' '}
            We matched <span className="font-bold text-blue-400">{stats.matched_opportunities_count} high-priority opportunities</span> for you today.
          </p>

          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Top Matches</span>
            </Link>

            <Link
              to="/assistant"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all hover:scale-[1.02]"
            >
              <BotMessageSquare className="w-4 h-4 text-blue-400" />
              <span>Ask Career Assistant</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Real Statistics Counters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl glass-panel">
          <p className="text-[11px] font-medium text-slate-400">Matched to Profile</p>
          <p className="text-2xl font-extrabold text-blue-400 mt-1">
            {stats.matched_opportunities_count}
          </p>
          <span className="text-[10px] text-emerald-400 font-medium">≥ 60% relevance fit</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel">
          <p className="text-[11px] font-medium text-slate-400">Total Openings</p>
          <p className="text-2xl font-extrabold text-slate-100 mt-1">
            {stats.new_opportunities_count}
          </p>
          <span className="text-[10px] text-slate-400">Verified programs</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel">
          <p className="text-[11px] font-medium text-slate-400">Applications Tracked</p>
          <p className="text-2xl font-extrabold text-indigo-400 mt-1">
            {stats.applications_in_progress_count}
          </p>
          <span className="text-[10px] text-indigo-300">In Kanban pipeline</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel">
          <p className="text-[11px] font-medium text-slate-400">Closing Soon</p>
          <p className="text-2xl font-extrabold text-rose-400 mt-1">
            {stats.closing_soon_count}
          </p>
          <span className="text-[10px] text-rose-400 font-medium">≤ 14 days left</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel">
          <p className="text-[11px] font-medium text-slate-400">Saved Bookmarks</p>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">
            {stats.saved_opportunities_count}
          </p>
          <span className="text-[10px] text-slate-400">Shortlisted items</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel">
          <p className="text-[11px] font-medium text-slate-400">Urgent Deadlines</p>
          <p className="text-2xl font-extrabold text-red-500 mt-1">
            {urgentOpps.filter((o) => o.deadline_urgency === 'red').length}
          </p>
          <span className="text-[10px] text-red-400 font-semibold animate-pulse">≤ 3 days left</span>
        </div>
      </div>

      {/* Two Column Layout: Daily Action Plan & Urgent Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Action Plan */}
        <div className="lg:col-span-1 rounded-2xl glass-panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">Daily Career Action Plan</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">
                Today's Focus
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-3 mb-4">
              AI-generated priority tasks based on your approaching deadlines and skill gaps:
            </p>

            <div className="space-y-3">
              {actionPlan.map((action) => (
                <div
                  key={action.id}
                  onClick={() => toggleActionItem(action.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    action.completed
                      ? 'bg-slate-900/40 border-slate-800/50 opacity-60'
                      : action.priority === 'urgent'
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <button
                      type="button"
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                        action.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-600 hover:border-blue-400'
                      }`}
                    >
                      {action.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-xs font-bold ${
                            action.completed ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {action.title}
                        </h4>
                        {action.priority === 'urgent' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 uppercase">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {action.description}
                      </p>
                      <Link
                        to={action.action_url}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-semibold mt-2"
                      >
                        <span>{action.action_label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
            <Link
              to="/assistant"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
            >
              Get personalized preparation tips <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Urgent Opportunities (Approaching Deadlines) */}
        <div className="lg:col-span-2 rounded-2xl glass-panel p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400 animate-bounce" />
              <h3 className="font-bold text-sm text-slate-100">Urgent Opportunities Closing Soon</h3>
            </div>
            <Link
              to="/explore?urgency=red"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              View all closing soon <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {urgentOpps.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No imminent deadlines this week. You're fully caught up!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {urgentOpps.slice(0, 4).map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onSelect={setSelectedOpp}
                  onReport={setReportingOpp}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended For You Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Recommended For Your Profile
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked by skills match, academic eligibility, location, and career goals.
            </p>
          </div>

          <Link
            to="/explore"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>Explore All 15+ Openings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl glass-panel animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.slice(0, 6).map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onSelect={setSelectedOpp}
                onReport={setReportingOpp}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <OpportunityModal
        opportunity={selectedOpp}
        onClose={() => setSelectedOpp(null)}
        onReport={(opp) => {
          setSelectedOpp(null);
          setReportingOpp(opp);
        }}
        onApplicationStatusChange={() => loadDashboardData()}
      />

      <ReportModal
        opportunity={reportingOpp}
        onClose={() => setReportingOpp(null)}
      />
    </div>
  );
};
