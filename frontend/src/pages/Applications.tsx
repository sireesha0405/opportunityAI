import React, { useState, useEffect } from 'react';
import {
  Kanban as KanbanIcon,
  Table as TableIcon,
  Search,
  Plus,
  Clock,
  Calendar,
  Building2,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronRight,
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { Application, Opportunity } from '../types';

const STATUS_COLUMNS = [
  { id: 'Interested', title: 'Interested', color: 'border-slate-700 bg-slate-900/50' },
  { id: 'Planning to apply', title: 'Planning to Apply', color: 'border-blue-900/50 bg-blue-950/20' },
  { id: 'Application in progress', title: 'In Progress', color: 'border-amber-900/50 bg-amber-950/20' },
  { id: 'Applied', title: 'Applied', color: 'border-indigo-900/50 bg-indigo-950/20' },
  { id: 'Assessment or interview', title: 'Interview / Test', color: 'border-purple-900/50 bg-purple-950/20' },
  { id: 'Offer received', title: 'Offer Received 🎉', color: 'border-emerald-900/50 bg-emerald-950/20' },
  { id: 'Rejected', title: 'Rejected', color: 'border-rose-900/50 bg-rose-950/10' },
  { id: 'Withdrawn', title: 'Withdrawn', color: 'border-slate-800 bg-slate-950/20' },
];

export const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Edit / Details modal state
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [notesText, setNotesText] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await api.listApplications({
        status: filterStatus !== 'All' ? filterStatus : undefined,
        search: searchQuery || undefined,
      });
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filterStatus, searchQuery]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      await api.updateApplication(appId, { status: newStatus });
      setApplications(
        applications.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (appId: string) => {
    if (!window.confirm('Are you sure you want to remove this tracked application?')) return;
    try {
      await api.deleteApplication(appId);
      setApplications(applications.filter((a) => a.id !== appId));
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (app: Application) => {
    setEditingApp(app);
    setNotesText(app.notes || '');
    setFollowUpDate(app.follow_up_date || '');
    setInterviewDate(app.interview_date || '');
  };

  const saveApplicationDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;
    setIsSaving(true);
    try {
      const updated = await api.updateApplication(editingApp.id, {
        notes: notesText,
        follow_up_date: followUpDate || undefined,
        interview_date: interviewDate || undefined,
      });
      setApplications(applications.map((a) => (a.id === editingApp.id ? updated : a)));
      setEditingApp(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <KanbanIcon className="w-6 h-6 text-blue-500" />
            <span>My Applications Pipeline</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your internship, scholarship, and hackathon applications from initial interest to offer letters.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-800 rounded-xl overflow-hidden bg-slate-900 p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <KanbanIcon className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl glass-panel">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company or role..."
            className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Filter Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses ({applications.length})</option>
            {STATUS_COLUMNS.map((col) => (
              <option key={col.id} value={col.id}>
                {col.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {STATUS_COLUMNS.map((col) => {
            const colApps = applications.filter((a) => a.status === col.id);
            return (
              <div
                key={col.id}
                className={`w-72 shrink-0 rounded-2xl border ${col.color} p-4 flex flex-col justify-between max-h-[75vh]`}
              >
                <div>
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                    <h3 className="font-bold text-xs text-slate-200">{col.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">
                      {colApps.length}
                    </span>
                  </div>

                  {/* Cards container */}
                  <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-1">
                    {colApps.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-slate-600 border border-dashed border-slate-800 rounded-xl">
                        No applications
                      </div>
                    ) : (
                      colApps.map((app) => (
                        <div
                          key={app.id}
                          className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-md hover:border-slate-700 transition-all space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-400">
                              {app.opportunity?.category || 'Opportunity'}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditModal(app)}
                                title="Edit notes & schedules"
                                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(app.id)}
                                title="Delete application"
                                className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-slate-100 leading-snug line-clamp-2">
                            {app.opportunity?.title || 'Unknown Opportunity'}
                          </h4>

                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-500" />
                            <span className="truncate">{app.opportunity?.organization}</span>
                          </p>

                          {app.notes && (
                            <p className="text-[10px] text-slate-400 italic bg-slate-950/60 p-1.5 rounded border border-slate-800/80 line-clamp-2">
                              "{app.notes}"
                            </p>
                          )}

                          {app.interview_date && (
                            <div className="text-[10px] text-purple-300 font-semibold flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-purple-400" />
                              <span>Interview: {new Date(app.interview_date).toLocaleDateString()}</span>
                            </div>
                          )}

                          {/* Quick Move Dropdown */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value)}
                              className="text-[10px] font-semibold rounded bg-slate-800 border border-slate-700 px-2 py-1 text-slate-300 focus:outline-none focus:border-blue-500"
                            >
                              {STATUS_COLUMNS.map((c) => (
                                <option key={c.id} value={c.id}>
                                  Move: {c.title}
                                </option>
                              ))}
                            </select>

                            {app.opportunity?.official_url && (
                              <a
                                href={app.opportunity.official_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 p-1"
                                title="Open company's official career webpage"
                              >
                                <span>Company Page</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl glass-panel overflow-hidden border border-slate-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-4">Opportunity</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Timeline / Interview</th>
                  <th className="p-4">Private Notes</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-slate-500">
                      No applications recorded yet.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-100">{app.opportunity?.title}</div>
                        <div className="text-[11px] text-slate-400">{app.opportunity?.organization}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400">
                          {app.opportunity?.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className="text-xs font-semibold rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-slate-200"
                        >
                          {STATUS_COLUMNS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-[11px] text-slate-400">
                        {app.interview_date ? (
                          <span className="text-purple-300 font-semibold block">
                            Interview: {new Date(app.interview_date).toLocaleDateString()}
                          </span>
                        ) : null}
                        {app.applied_date && (
                          <span>Applied: {new Date(app.applied_date).toLocaleDateString()}</span>
                        )}
                      </td>
                      <td className="p-4 max-w-xs truncate text-[11px] text-slate-400">
                        {app.notes || '—'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(app)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="Edit notes & schedule"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Notes & Interview Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1">
              Edit Tracker: {editingApp.opportunity?.title}
            </h3>
            <p className="text-xs text-slate-400 mb-4">{editingApp.opportunity?.organization}</p>

            <form onSubmit={saveApplicationDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Private Personal Notes
                </label>
                <textarea
                  rows={4}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Record portfolio submission notes, referral contact, recruiter questions..."
                  className="w-full text-xs rounded-xl bg-slate-800 border border-slate-700 p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Follow-Up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Interview Schedule
                  </label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              {/* Status Audit History */}
              {editingApp.history && editingApp.history.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="font-semibold text-slate-400 block mb-2 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" /> State Transition History
                  </span>
                  <div className="space-y-1.5 max-h-24 overflow-y-auto">
                    {editingApp.history.map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-medium text-slate-300">{h.status}</span>
                        <span>{new Date(h.changed_at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
