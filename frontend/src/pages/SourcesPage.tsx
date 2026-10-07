import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Database,
  Lock,
  Server
} from 'lucide-react';
import { api } from '../services/api';
import { SourceItem } from '../types';

export const SourcesPage: React.FC = () => {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const data = await api.listSources();
      setSources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await api.syncSources();
      setSyncMessage(`Successfully synchronized ${res.sources_synced} source feeds.`);
      fetchSources();
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err: any) {
      setSyncMessage(err.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>Opportunity Sources & Trust Verification</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Modular source aggregator, verified official endpoints, and transparent trustworthiness scoring.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={async () => {
              setSyncing(true);
              try {
                const res = await api.syncUnstop();
                setSyncMessage(res.message);
                await fetchSources();
                setTimeout(() => setSyncMessage(null), 5000);
              } catch (err: any) {
                setSyncMessage(err.message || 'Sync failed');
              } finally {
                setSyncing(false);
              }
            }}
            disabled={syncing}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>Sync Unstop Feed</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync All Sources'}</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Trust Scoring Explanation Card */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-400" />
          <span>How OpportunityAI Verifies Authenticity & Protects Students</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Students encounter misleading, expired, or fraudulent job and scholarship listings across unverified social feeds. Every opportunity in OpportunityAI passes through an automated and transparent multi-factor trust verification model:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="font-bold text-emerald-400 block mb-1">1. Domain Authority</span>
            <span className="text-slate-400 text-[11px]">
              Strictly verifies organization TLS/SSL certs, official university domains (.ac.in, .edu), and corporate careers portals.
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="font-bold text-blue-400 block mb-1">2. Deadline Freshness</span>
            <span className="text-slate-400 text-[11px]">
              Automatic deadline tracking flags and excludes expired opportunities, preventing wasted student application efforts.
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="font-bold text-purple-400 block mb-1">3. Community Flagging</span>
            <span className="text-slate-400 text-[11px]">
              Every card has a report button allowing students to immediately flag broken links, changed criteria, or suspicious postings.
            </span>
          </div>
        </div>
      </div>

      {/* Sources Table */}
      <div className="rounded-2xl glass-panel overflow-hidden border border-slate-800">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Server className="w-4 h-4 text-blue-400" />
            <span>Configured Source Feeds ({sources.length})</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Source Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Base URL</th>
                <th className="p-4">Sync Status</th>
                <th className="p-4">Last Verified</th>
                <th className="p-4 text-right">Records Synced</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {sources.map((src) => (
                <tr key={src.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-bold text-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{src.name}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 uppercase">
                      {src.type}
                    </span>
                  </td>
                  <td className="p-4 text-blue-400 truncate max-w-xs">
                    <a
                      href={src.base_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      <span>{src.base_url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {src.sync_status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 text-[11px]">
                    {src.last_sync ? new Date(src.last_sync).toLocaleString() : 'Recent'}
                  </td>
                  <td className="p-4 text-right font-bold text-slate-100">
                    {src.total_imported}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
