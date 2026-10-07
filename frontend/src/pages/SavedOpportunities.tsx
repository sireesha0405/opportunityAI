import React, { useState, useEffect } from 'react';
import { Bookmark, ArrowUpRight, Trash2, Building2, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { SavedOpportunity, Opportunity } from '../types';
import { OpportunityModal } from '../components/OpportunityModal';
import { ReportModal } from '../components/ReportModal';

export const SavedOpportunities: React.FC = () => {
  const [savedList, setSavedList] = useState<SavedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [reportingOpp, setReportingOpp] = useState<Opportunity | null>(null);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const data = await api.listSaved();
      setSavedList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (oppId: string) => {
    try {
      await api.unsaveOpportunity(oppId);
      setSavedList(savedList.filter((s) => s.opportunity_id !== oppId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-amber-400 fill-amber-400" />
          <span>Saved Opportunities</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Your bookmarked scholarships, internships, and hackathons with deadline alerts.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-2xl glass-panel animate-pulse" />
          ))}
        </div>
      ) : savedList.length === 0 ? (
        <div className="py-20 text-center rounded-2xl glass-panel space-y-3">
          <Bookmark className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No saved opportunities yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the bookmark icon on any opportunity card in the Explore or Dashboard tab to save it for quick reference.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedList.map((item) => {
            const opp = item.opportunity;
            if (!opp) return null;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedOpp(opp)}
                className="rounded-2xl glass-panel glass-panel-hover p-5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400">
                      {opp.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.opportunity_id);
                      }}
                      title="Remove from saved"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 line-clamp-2">
                    {opp.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <a
                      href={opp.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 text-slate-300 hover:text-blue-400 font-semibold transition-colors"
                      title={`Open ${opp.organization}'s official webpage`}
                    >
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span className="truncate">{opp.organization}</span>
                      <ArrowUpRight className="w-3 h-3 text-blue-400" />
                    </a>
                  </div>

                  <div className="mt-4 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Deadline:
                    </span>
                    <span className="font-semibold text-slate-200">
                      {new Date(opp.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-blue-400 font-semibold hover:underline">
                    View Checklist
                  </span>
                  <a
                    href={opp.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title={`Open ${opp.organization}'s official webpage: ${opp.official_url}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white inline-flex items-center gap-1 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
                  >
                    <span>Company Page</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <OpportunityModal
        opportunity={selectedOpp}
        onClose={() => setSelectedOpp(null)}
        onReport={(opp) => {
          setSelectedOpp(null);
          setReportingOpp(opp);
        }}
      />

      <ReportModal
        opportunity={reportingOpp}
        onClose={() => setReportingOpp(null)}
      />
    </div>
  );
};
