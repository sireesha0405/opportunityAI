import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  RefreshCw,
  Bot,
  ArrowRight,
  FilterX,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { api } from '../services/api';
import { Opportunity } from '../types';
import { OpportunityCard } from '../components/OpportunityCard';
import { OpportunityModal } from '../components/OpportunityModal';
import { ReportModal } from '../components/ReportModal';

export const Explore: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [category, setCategory] = useState<string>(searchParams.get('category') || 'All');
  const [workMode, setWorkMode] = useState<string>('All');
  const [eligibility, setEligibility] = useState<string>('All');
  const [urgency, setUrgency] = useState<string>(searchParams.get('urgency') || 'All');
  const [source, setSource] = useState<string>(searchParams.get('source') || 'All');
  const [sortBy, setSortBy] = useState<string>('match_desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Unstop Live Sync state
  const [syncingUnstop, setSyncingUnstop] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Natural Language Search mode
  const [isNlpMode, setIsNlpMode] = useState<boolean>(false);
  const [nlpQuery, setNlpQuery] = useState<string>(
    'Find remote software engineering internships for third-year CSE students closing within two weeks'
  );
  const [nlpMeta, setNlpMeta] = useState<{ intent?: string; total?: number } | null>(null);

  // Modals
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [reportingOpp, setReportingOpp] = useState<Opportunity | null>(null);

  const categories = [
    'All',
    'Internship',
    'Hackathon',
    'Scholarship',
    'Fellowship',
    'Competition',
    'Workshop',
    'Certification',
    'Research Program',
    'Entry-level Job',
  ];

  const fetchOpportunities = async () => {
    setLoading(true);
    setNlpMeta(null);
    try {
      if (isNlpMode && nlpQuery.trim()) {
        const nlpRes = await api.searchNaturalLanguage(nlpQuery);
        setOpportunities(nlpRes.results);
        setNlpMeta({ intent: nlpRes.detected_intent, total: nlpRes.total_found });
      } else {
        const opps = await api.listOpportunities({
          category,
          work_mode: workMode,
          eligibility,
          urgency,
          search: searchQuery,
          source,
          sort_by: sortBy,
        });
        setOpportunities(opps);

        // Check if an ID query param is present to auto-open modal
        const oppIdParam = searchParams.get('id');
        if (oppIdParam) {
          const matched = opps.find((o) => o.id === oppIdParam);
          if (matched) setSelectedOpp(matched);
        }
      }
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncUnstop = async () => {
    setSyncingUnstop(true);
    setSyncMessage(null);
    try {
      const res = await api.syncUnstop();
      setSyncMessage(res.message || 'Successfully synced opportunities from Unstop!');
      await fetchOpportunities();
      setTimeout(() => setSyncMessage(null), 5000);
    } catch (err: any) {
      console.error('Unstop sync error:', err);
      setSyncMessage(err.message || 'Failed to sync with Unstop');
    } finally {
      setSyncingUnstop(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [category, workMode, eligibility, urgency, source, sortBy, isNlpMode]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOpportunities();
  };

  const resetFilters = () => {
    setCategory('All');
    setWorkMode('All');
    setEligibility('All');
    setUrgency('All');
    setSource('All');
    setSearchQuery('');
    setSortBy('match_desc');
    setIsNlpMode(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Explore Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Discover verified scholarships, internships, hackathons, and jobs from Unstop and official enterprise portals.
          </p>
        </div>

        {/* Action buttons: Sync Unstop & NLP Mode */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSyncUnstop}
            disabled={syncingUnstop}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all shadow-sm disabled:opacity-50"
            title="Fetch live opportunities from Unstop (unstop.com)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingUnstop ? 'animate-spin' : ''}`} />
            <span>{syncingUnstop ? 'Syncing Unstop...' : 'Sync Unstop Feed'}</span>
          </button>

          <button
            onClick={() => {
              setIsNlpMode(!isNlpMode);
              if (!isNlpMode) {
                setNlpQuery(
                  'Find remote software engineering internships for third-year CSE students closing within two weeks'
                );
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isNlpMode
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 ring-2 ring-blue-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Bot className="w-4 h-4 text-blue-400" />
            <span>{isNlpMode ? 'Exit AI Query Mode' : 'Natural Language Search'}</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Company Webpage Guarantee Banner */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>
            <strong className="text-white">Direct Official Web Page Guarantee:</strong> Every opportunity opens directly in the company's authenticated career page.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold text-[10px]">
            {opportunities.filter((o) => o.source_name?.toLowerCase().includes('unstop')).length} Unstop Listings
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-semibold text-[10px]">
            {opportunities.length} Total Verified
          </span>
        </div>
      </div>

      {/* NLP Prompt Banner */}
      {isNlpMode ? (
        <form
          onSubmit={handleManualSearch}
          className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 space-y-3"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
            <Sparkles className="w-4 h-4" />
            <span>AI Natural Language Search Engine</span>
          </div>
          <p className="text-xs text-slate-400">
            Type your full requirements naturally (degree, role, work mode, deadlines, skills).
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nlpQuery}
              onChange={(e) => setNlpQuery(e.target.value)}
              placeholder="e.g. Find remote software engineering internships for third-year CSE students closing within two weeks"
              className="flex-1 text-xs sm:text-sm rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {nlpMeta && (
            <div className="text-xs text-emerald-400 font-medium">
              ✓ {nlpMeta.intent} • Found {nlpMeta.total} matching program(s)
            </div>
          )}
        </form>
      ) : (
        /* Regular Search & Structured Filters */
        <div className="space-y-4">
          {/* Main search input */}
          <form onSubmit={handleManualSearch} className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company, or required skill (e.g. Python, AWS, React, Google)..."
              className="w-full text-xs sm:text-sm rounded-xl bg-slate-900/90 border border-slate-800 pl-11 pr-24 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all"
            >
              Search
            </button>
          </form>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  category === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Structured Dropdown Filter Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl glass-panel">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {/* Work Mode */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Mode:</span>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All Modes</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              {/* Eligibility Check */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Eligibility:</span>
                <select
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All Opportunities</option>
                  <option value="Eligible">Eligible for My Profile</option>
                  <option value="Potentially Eligible">Potentially Eligible</option>
                </select>
              </div>

              {/* Deadline Urgency */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Deadline:</span>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All Deadlines</option>
                  <option value="red">Urgent (≤ 3 days left)</option>
                  <option value="yellow">Approaching (4–14 days)</option>
                  <option value="green">Open (&gt; 14 days)</option>
                </select>
              </div>

              {/* Source Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Source:</span>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="All">All Sources</option>
                  <option value="Unstop">Unstop Opportunities</option>
                  <option value="Official">Enterprise Portals</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(category !== 'All' ||
                workMode !== 'All' ||
                eligibility !== 'All' ||
                urgency !== 'All' ||
                source !== 'All' ||
                searchQuery) && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-semibold"
                >
                  <FilterX className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Sorting & Grid/List View Toggle */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="match_desc">Best AI Match</option>
                  <option value="deadline_asc">Nearest Deadline</option>
                  <option value="newest">Newest Added</option>
                  <option value="title_asc">Title (A-Z)</option>
                </select>
              </div>

              <div className="flex items-center border border-slate-800 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="List view"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Showing <span className="font-bold text-slate-200">{opportunities.length}</span> verified opportunity listings
        </span>
        <button
          onClick={fetchOpportunities}
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Opportunity Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl glass-panel animate-pulse" />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="py-16 text-center rounded-2xl glass-panel space-y-3">
          <p className="text-base font-semibold text-slate-300">No opportunities match these filters.</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try broadening your work mode, category, or deadline filters to view more student programs.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
              : 'space-y-4'
          }
        >
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onSelect={setSelectedOpp}
              onReport={setReportingOpp}
              onSavedChange={(id, saved) => {
                setOpportunities(
                  opportunities.map((o) => (o.id === id ? { ...o, is_saved: saved } : o))
                );
              }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <OpportunityModal
        opportunity={selectedOpp}
        onClose={() => setSelectedOpp(null)}
        onReport={(opp) => {
          setSelectedOpp(null);
          setReportingOpp(opp);
        }}
        onApplicationStatusChange={(id, status) => {
          setOpportunities(
            opportunities.map((o) =>
              o.id === id ? { ...o, is_applied: true, current_application_status: status } : o
            )
          );
        }}
      />

      <ReportModal
        opportunity={reportingOpp}
        onClose={() => setReportingOpp(null)}
      />
    </div>
  );
};
