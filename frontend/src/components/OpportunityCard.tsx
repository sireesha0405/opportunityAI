import React, { useState } from 'react';
import {
  ExternalLink,
  Bookmark,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Building2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Flag,
  ArrowUpRight
} from 'lucide-react';
import { Opportunity } from '../types';
import { api } from '../services/api';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onSelect?: (opp: Opportunity) => void;
  onReport?: (opp: Opportunity) => void;
  onSavedChange?: (oppId: string, isSaved: boolean) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onSelect,
  onReport,
  onSavedChange,
}) => {
  const [isSaved, setIsSaved] = useState(opportunity.is_saved || false);
  const [showDetails, setShowDetails] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaveLoading(true);
    try {
      if (isSaved) {
        await api.unsaveOpportunity(opportunity.id);
        setIsSaved(false);
        onSavedChange?.(opportunity.id, false);
      } else {
        await api.saveOpportunity(opportunity.id);
        setIsSaved(true);
        onSavedChange?.(opportunity.id, true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  // Urgency color styling
  const urgency = opportunity.deadline_urgency || 'yellow';
  const urgencyConfig = {
    red: {
      badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      label: `Urgent: ${opportunity.days_remaining}d left`,
      pulse: true,
    },
    yellow: {
      badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      label: `${opportunity.days_remaining}d remaining`,
      pulse: false,
    },
    green: {
      badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      label: `${opportunity.days_remaining}d remaining`,
      pulse: false,
    },
    expired: {
      badge: 'bg-slate-700/50 text-slate-400 border-slate-600/30',
      label: 'Expired',
      pulse: false,
    },
  }[urgency];

  // Eligibility badge styling
  const eligibility = opportunity.eligibility_status || 'Eligible';
  const eligibilityBadge = {
    Eligible: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'Potentially Eligible': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'Not Eligible': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    'Eligibility Information Unavailable': 'bg-slate-700/30 text-slate-400 border-slate-600/30',
  }[eligibility];

  const matchScore = opportunity.match_score || 85;

  return (
    <div
      onClick={() => onSelect?.(opportunity)}
      className="group relative rounded-2xl glass-panel glass-panel-hover p-5 cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      {/* Top Banner: Verification badge & Save bookmark */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Category tag */}
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
              {opportunity.category}
            </span>

            {/* Unstop Badge if from Unstop */}
            {opportunity.source_name?.toLowerCase().includes('unstop') && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Unstop
              </span>
            )}

            {/* Work Mode */}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {opportunity.work_mode}
            </span>

            {/* Verified badge */}
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              title={`Trust Score: ${opportunity.trust_score}/100 — ${opportunity.verification_notes}`}
            >
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              <span>{opportunity.verification_status}</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleSave}
              disabled={saveLoading}
              title={isSaved ? 'Remove from saved' : 'Save opportunity'}
              className={`p-1.5 rounded-lg border transition-all ${
                isSaved
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-100 hover:border-slate-600'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
            </button>

            {onReport && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReport(opportunity);
                }}
                title="Report listing"
                className="p-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40 text-slate-500 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Opportunity Title & Organization */}
        <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
          {opportunity.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 flex-wrap">
          {/* Direct link to company official website */}
          <a
            href={opportunity.official_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={`Open ${opportunity.organization}'s official webpage (${opportunity.official_url})`}
            className="inline-flex items-center gap-1 font-semibold text-slate-200 hover:text-blue-400 transition-colors group/org"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate max-w-[150px] underline decoration-slate-700 group-hover/org:decoration-blue-400">{opportunity.organization}</span>
            <ArrowUpRight className="w-3 h-3 text-blue-400 opacity-80" />
          </a>

          <span className="flex items-center gap-1 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[120px]">{opportunity.location}</span>
          </span>
        </div>

        {/* AI Match & Urgency Row */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/70">
          {/* Match Score */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/20">
              {matchScore}%
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium leading-none">AI Fit Score</p>
              <p className="text-[11px] font-semibold text-blue-400 leading-none mt-1">
                {matchScore >= 85 ? 'Strong Match' : matchScore >= 70 ? 'Good Fit' : 'Fair Alignment'}
              </p>
            </div>
          </div>

          {/* Deadline Urgency Pill */}
          <div className="flex items-center justify-end">
            <div
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1.5 ${urgencyConfig.badge}`}
            >
              <Clock className="w-3 h-3" />
              <span>{urgencyConfig.label}</span>
              {urgencyConfig.pulse && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping ml-0.5" />
              )}
            </div>
          </div>
        </div>

        {/* Eligibility Check Pill */}
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">Eligibility Status:</span>
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${eligibilityBadge}`}
          >
            {eligibility}
          </span>
        </div>

        {/* Skills Tag Line */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {opportunity.required_skills?.slice(0, 3).map((skill) => {
            const isMatched = opportunity.matched_skills?.includes(skill);
            return (
              <span
                key={skill}
                className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                  isMatched
                    ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isMatched ? '✓ ' : ''}
                {skill}
              </span>
            );
          })}
          {(opportunity.required_skills?.length || 0) > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-500 font-medium">
              +{opportunity.required_skills.length - 3} more
            </span>
          )}
        </div>

        {/* Expandable Reasons & Actions */}
        {opportunity.reasons && opportunity.reasons.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400">
            <p className="flex items-center gap-1 text-blue-400 font-medium mb-1">
              <Sparkles className="w-3 h-3" /> Why this matches you:
            </p>
            <p className="text-slate-300 line-clamp-2 leading-relaxed">
              {opportunity.reasons[0]}
            </p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(opportunity);
          }}
          className="text-xs font-semibold text-slate-300 hover:text-blue-300 transition-colors"
        >
          View Criteria & Match
        </button>

        <a
          href={opportunity.official_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title={`Opens ${opportunity.organization}'s official career website: ${opportunity.official_url}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02]"
        >
          <span>Official Company Page</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
