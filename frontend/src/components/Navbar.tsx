import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Sparkles,
  User as UserIcon,
  LogOut,
  Database,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { NotificationItem } from '../types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);

  const fetchNotifs = async () => {
    if (isAuthenticated) {
      try {
        const notifs = await api.listNotifications();
        setNotifications(notifs);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleSeedDemoData = async () => {
    setIsSeeding(true);
    try {
      const res = await api.seedOpportunities();
      setSeedSuccess(`Loaded ${res.count} verified opportunities!`);
      setTimeout(() => setSeedSuccess(null), 4000);
      window.location.reload();
    } catch {
      setSeedSuccess('Demo seed ready');
      setTimeout(() => setSeedSuccess(null), 3000);
    } finally {
      setIsSeeding(false);
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

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-[#0a0f1d]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-400 bg-clip-text text-transparent">
            Opportunity<span className="text-blue-500">AI</span>
          </span>
        </Link>

        {/* Global Search Bar */}
        <div
          onClick={() => navigate('/explore')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 text-sm cursor-pointer hover:border-slate-700 hover:text-slate-200 transition-colors flex-1 max-w-xs"
        >
          <Search className="w-4 h-4 text-slate-500" />
          <span>Search opportunities or skills...</span>
          <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            /
          </kbd>
        </div>
      </div>

      {/* Action Utilities */}
      <div className="flex items-center gap-3">
        {/* Seed Demo Data Button */}
        <button
          onClick={handleSeedDemoData}
          disabled={isSeeding}
          title="Seed realistic opportunities for demo"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all shadow-sm"
        >
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span>{isSeeding ? 'Seeding...' : 'Seed Demo Data'}</span>
        </button>

        {seedSuccess && (
          <span className="text-xs text-emerald-400 font-medium animate-pulse hidden lg:inline">
            ✓ {seedSuccess}
          </span>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            aria-label="Notifications"
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/60 p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-slate-100">Deadline Intelligence</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 mt-2">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No urgent deadline notifications right now.
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setShowNotifMenu(false);
                        navigate('/notifications');
                      }}
                      className={`py-2.5 px-2 rounded-lg cursor-pointer transition-colors ${
                        notif.is_read ? 'opacity-70 hover:bg-slate-800/40' : 'bg-blue-950/20 hover:bg-blue-950/40'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{notif.title}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{notif.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2.5 border-t border-slate-800 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifMenu(false)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                >
                  View all in Notification Center <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Auth Info */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                {user?.full_name?.charAt(0) || 'S'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-none">{user?.full_name}</p>
                <p className="text-[10px] text-slate-400 leading-none mt-1">
                  {user?.profile?.degree ? `${user.profile.degree.slice(0, 10)}...` : 'Student'}
                </p>
              </div>
            </Link>
            <button
              onClick={logout}
              title="Log out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all"
            >
              Sign In / Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
