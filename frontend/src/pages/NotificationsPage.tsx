import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Mail,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { NotificationItem } from '../types';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const data = await api.listNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifs =
    filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-500" />
            <span>Notification & Deadline Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time deadline reminders, opportunity status changes, and match alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Email Delivery Status Banner */}
      <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 flex items-start gap-3 text-xs">
        <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-200">In-App & Email Deadline Alerts</p>
          <p className="text-slate-400 mt-0.5 leading-relaxed">
            In-app notifications are actively generated at 7-day, 3-day, and final-day intervals without duplicates. If an SMTP server is configured in your environment, instant email reminders will also be dispatched directly to your registered inbox.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Unread ({notifications.filter((n) => !n.is_read).length})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl glass-panel animate-pulse" />
          ))}
        </div>
      ) : filteredNotifs.length === 0 ? (
        <div className="py-20 text-center rounded-2xl glass-panel space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">You're all caught up!</h3>
          <p className="text-xs text-slate-500">No unread notifications at the moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                notif.is_read
                  ? 'bg-slate-900/40 border-slate-800/80 opacity-75'
                  : 'bg-blue-950/20 border-blue-500/30 shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 shrink-0 text-amber-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-100">{notif.title}</h4>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-500 mt-2 block">
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {notif.opportunity_id && (
                  <Link
                    to={`/explore?id=${notif.opportunity_id}`}
                    onClick={() => handleMarkRead(notif.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 shadow-sm"
                  >
                    <span>View Opportunity</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
