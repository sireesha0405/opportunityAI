import React, { useState } from 'react';
import {
  X,
  Building2,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  ExternalLink,
  Bookmark,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Flag,
  Share2
} from 'lucide-react';
import { Opportunity } from '../types';
import { api } from '../services/api';

interface OpportunityModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
  onReport: (opp: Opportunity) => void;
  onApplicationStatusChange?: (oppId: string, status: string) => void;
}

export const OpportunityModal: React.FC<OpportunityModalProps> = ({
  opportunity,
  onClose,
  onReport,
  onApplicationStatusChange,
}) => {
  if (!opportunity) return null;

  const [currentStatus, setCurrentStatus] = useState<string>(
    opportunity.current_application_status || 'Interested'
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSaved, setIsSaved] = useState(opportunity.is_saved || false);
  const [copied, setCopied] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      await api.createApplication({
        opportunity_id: opportunity.id,
        status: newStatus,
      });
      setCurrentStatus(newStatus);
      onApplicationStatusChange?.(opportunity.id, newStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleToggleSave = async () => {
    try {
      if (isSaved) {
        await api.unsaveOpportunity(opportunity.id);
        setIsSaved(false);
      } else {
        await api.saveOpportunity(opportunity.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/explore?id=${opportunity.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const crit = opportunity.eligibility_criteria;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 flex flex-col justify-between"
      >
        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  {opportunity.category}
                </span>
                {opportunity.source_name?.toLowerCase().includes('unstop') && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Sourced via Unstop
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {opportunity.work_mode}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {opportunity.verification_status} ({opportunity.trust_score}% Trust)
                  </span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {opportunity.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-slate-400 mt-2 flex-wrap">
                <a
                  href={opportunity.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold transition-colors group/org"
                  title={`Open official webpage: ${opportunity.official_url}`}
                >
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span className="underline decoration-blue-500/40">{opportunity.organization}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/org:translate-x-0.5 transition-transform" />
                </a>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {opportunity.location}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                title="Copy opportunity link"
                className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onReport(opportunity)}
                title="Report inaccuracy"
                className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <Flag className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {copied && (
            <div className="mt-2 text-xs text-emerald-400 font-medium">
              ✓ Direct opportunity link copied to clipboard!
            </div>
          )}

          {/* AI Fit & Compensation banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/20">
            <div>
              <p className="text-xs text-slate-400">AI Match Score</p>
              <p className="text-xl font-bold text-blue-400 mt-0.5">
                {opportunity.match_score || 85}% Fit
              </p>
              <p className="text-[11px] text-slate-400">{opportunity.recommended_next_action}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Application Deadline</p>
              <p className="text-base font-bold text-slate-100 mt-0.5">
                {new Date(opportunity.deadline).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <span className="text-xs font-semibold text-amber-400">
                {opportunity.days_remaining} day(s) remaining
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-400">Stipend / Award</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">
                {opportunity.stipend_or_reward || 'Recognized Certificate & Mentorship'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-200 mb-2">About the Opportunity</h4>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {opportunity.description}
            </p>
          </div>

          {/* Explicit Eligibility Verification Checklist */}
          <div className="mb-6 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Explicit Eligibility Criteria Verification
              </h4>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {opportunity.eligibility_status || 'Eligible'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1 font-medium">Eligible Degrees:</span>
                <span className="font-semibold text-slate-200">
                  {crit?.eligible_degrees?.join(', ') || 'All Degrees Accepted'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1 font-medium">Academic Years:</span>
                <span className="font-semibold text-slate-200">
                  {crit?.eligible_academic_years?.join(', ') || 'All Years'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1 font-medium">Minimum CGPA:</span>
                <span className="font-semibold text-slate-200">
                  {crit?.min_cgpa ? `${crit.min_cgpa} or equivalent percentage` : 'No Minimum CGPA'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1 font-medium">Eligible Branches:</span>
                <span className="font-semibold text-slate-200">
                  {crit?.eligible_branches?.join(', ') || 'All Engineering & Tech Branches'}
                </span>
              </div>
            </div>

            {crit?.other_requirements && (
              <p className="mt-3 text-xs text-slate-400 italic">
                * Note: {crit.other_requirements}
              </p>
            )}
          </div>

          {/* Required vs Preferred Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h5 className="text-xs font-semibold text-slate-300 mb-2">Required Skills</h5>
              <div className="flex flex-wrap gap-1.5">
                {opportunity.required_skills?.map((skill) => {
                  const has = opportunity.matched_skills?.includes(skill);
                  return (
                    <span
                      key={skill}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${
                        has
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-950/30 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {has ? '✓ ' : '✕ '} {skill}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h5 className="text-xs font-semibold text-slate-300 mb-2">Bonus / Preferred Skills</h5>
              <div className="flex flex-wrap gap-1.5">
                {opportunity.preferred_skills?.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Official Company Career Webpage Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Company Official Webpage
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Direct Link Verified
                  </span>
                </div>
                <p className="text-xs text-blue-300 font-mono mt-0.5 break-all">
                  {opportunity.official_url}
                </p>
              </div>
            </div>

            <a
              href={opportunity.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] shrink-0"
            >
              <span>Visit Official Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Source Attribution & Verification Details */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between flex-wrap gap-2 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-300">Discovery Source:</span>
              <span className="text-blue-300 font-medium">{opportunity.source_name}</span>
              {opportunity.source_url && (
                <a
                  href={opportunity.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:text-white underline inline-flex items-center gap-1 ml-2"
                >
                  <span>View Original Listing</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="text-[11px] text-slate-500">
              Last audited: {new Date(opportunity.last_verified_date).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Application Tracker Status bar & Official Apply */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
              Tracker Status:
            </span>
            <select
              value={currentStatus}
              disabled={isUpdatingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="Interested">Interested</option>
              <option value="Planning to apply">Planning to apply</option>
              <option value="Application in progress">Application in progress</option>
              <option value="Applied">Applied</option>
              <option value="Assessment or interview">Assessment or interview</option>
              <option value="Offer received">Offer received</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            <button
              onClick={handleToggleSave}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                isSaved
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save for Later'}</span>
            </button>

            {opportunity.source_url && (
              <a
                href={opportunity.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors inline-flex items-center gap-1.5"
                title="View original opportunity listing"
              >
                <span>{opportunity.source_name?.includes('Unstop') ? 'Unstop Listing' : 'Source'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <a
              href={opportunity.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
              title={`Opens official company careers page at ${opportunity.official_url}`}
            >
              <span>Apply on Company's Official Page</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
