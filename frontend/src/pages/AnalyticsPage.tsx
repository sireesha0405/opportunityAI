import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { BarChart3, TrendingUp, CheckCircle, PieChart as PieIcon, Activity } from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsData } from '../types';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1'];

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <span>Analytics & Career Reports</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Real-time metrics on opportunity matches, application conversions, and skill demand in your target domain.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 rounded-2xl glass-panel animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Top 4 Stats Highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass-panel">
              <span className="text-xs text-slate-400">Total Profile Matches</span>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {data.stats.matched_opportunities_count}
              </p>
              <span className="text-[10px] text-slate-500">Above 60% match threshold</span>
            </div>
            <div className="p-4 rounded-2xl glass-panel">
              <span className="text-xs text-slate-400">In Active Pipeline</span>
              <p className="text-2xl font-bold text-purple-400 mt-1">
                {data.stats.applications_in_progress_count}
              </p>
              <span className="text-[10px] text-slate-500">Submissions & interviews</span>
            </div>
            <div className="p-4 rounded-2xl glass-panel">
              <span className="text-xs text-slate-400">Deadlines Approaching</span>
              <p className="text-2xl font-bold text-rose-400 mt-1">
                {data.stats.closing_soon_count}
              </p>
              <span className="text-[10px] text-slate-500">Closing within 14 days</span>
            </div>
            <div className="p-4 rounded-2xl glass-panel">
              <span className="text-xs text-slate-400">Bookmarked Opportunities</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {data.stats.saved_opportunities_count}
              </p>
              <span className="text-[10px] text-slate-500">Targeted opportunities</span>
            </div>
          </div>

          {/* Charts Row 1: Applications by Status & Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications by Status Bar Chart */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-blue-400" />
                <span>Applications by Pipeline Status</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.applications_by_status}>
                    <XAxis
                      dataKey="status"
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Opportunities by Category Pie Chart */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-4">
                <PieIcon className="w-4 h-4 text-purple-400" />
                <span>Opportunity Category Breakdown</span>
              </h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.opportunities_by_category}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      label={({ name, percent }: any) => `${name || ''} ${(((percent as number) || 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {data.opportunities_by_category.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Most Common Required Skills & Match Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top In-Demand Skills */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Top In-Demand Skills Across All Verified Postings</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.top_in_demand_skills} layout="vertical">
                    <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="skill"
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Activity Line Chart */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span>Weekly Student Application & Shortlisting Cadence</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.weekly_activity}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="applied"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="saved"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
