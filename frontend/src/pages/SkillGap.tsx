import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  GraduationCap
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SkillGapReport } from '../types';

export const SkillGap: React.FC = () => {
  const { user } = useAuth();
  const [report, setReport] = useState<SkillGapReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSkillReport = async () => {
    setLoading(true);
    try {
      const data = await api.getSkillAnalysis();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillReport();
  }, [user]);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-500" />
          <span>Skill-Gap Intelligence</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Bridge the gap between your university coursework and industry opportunities with data-backed learning roadmaps.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-44 rounded-2xl glass-panel animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-64 rounded-2xl glass-panel animate-pulse" />
            <div className="h-64 rounded-2xl glass-panel animate-pulse" />
          </div>
        </div>
      ) : report ? (
        <div className="space-y-8">
          {/* Matched vs Missing Summary Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Verified Skills in Profile */}
            <div className="p-5 rounded-2xl glass-panel border border-emerald-500/20 bg-emerald-950/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Your Current Profile Skills ({report.matched_skills.length})</span>
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                  Active Strengths
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Skills you have added that are actively matching opportunities in the database:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {report.matched_skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* High-Impact Missing Skills */}
            <div className="p-5 rounded-2xl glass-panel border border-amber-500/20 bg-amber-950/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Targeted Skill Gaps ({report.missing_skills.length})</span>
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                  Highest ROI
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Frequently requested in high-stipend openings but currently missing from your profile:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {report.missing_skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Market Frequency & Opportunity Unlocking Table */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Market Demand & Opportunity Unlocking Potential</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                See which skills unlock the largest volume of high-match internships and research programs:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {report.frequent_market_skills.map((item) => (
                <div
                  key={item.skill}
                  className={`p-3.5 rounded-xl border transition-all ${
                    item.user_has
                      ? 'bg-slate-900/60 border-slate-800'
                      : 'bg-gradient-to-r from-slate-900 to-indigo-950/30 border-blue-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-200">{item.skill}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.user_has
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {item.user_has ? 'Acquired' : 'High ROI'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">{item.unlock_potential}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Curated Step-by-Step Learning Roadmaps */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Personalized Learning Sequence & Free High-Quality Roadmaps</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.recommended_learning_path.map((path, idx) => (
                <div
                  key={path.skill}
                  className="rounded-2xl glass-panel p-5 border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 text-xs font-bold flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-white">{path.skill}</h4>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        {path.difficulty}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mt-2">
                      {path.description}
                    </p>

                    <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                        {path.resource_type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        ~{path.estimated_hours} hours estimated
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      Unlocks {path.unlocked_count} target opening(s)
                    </span>
                    <a
                      href={path.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105"
                    >
                      <span>Start Learning</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
