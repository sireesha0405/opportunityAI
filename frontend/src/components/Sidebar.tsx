import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  MapPin,
  Kanban,
  Bookmark,
  BotMessageSquare,
  TrendingUp,
  BarChart3,
  Bell,
  UserCheck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/explore', label: 'Explore Opportunities', icon: Compass },
    { to: '/map', label: 'Opportunity Map', icon: MapPin },
    { to: '/applications', label: 'My Applications', icon: Kanban },
    { to: '/saved', label: 'Saved Opportunities', icon: Bookmark },
    { to: '/assistant', label: 'Daily Career Assistant', icon: BotMessageSquare, highlight: true },
    { to: '/skill-gap', label: 'Skill Gap Analysis', icon: TrendingUp },
    { to: '/analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/sources', label: 'Sources & Trust', icon: ShieldCheck },
    { to: '/profile', label: 'My Profile', icon: UserCheck },
  ];

  return (
    <aside
      className={`relative shrink-0 border-r border-slate-800/80 bg-[#0d1326] transition-all duration-300 flex flex-col z-20 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center shadow-md z-30 transition-transform hover:scale-110"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Navigation items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              } ${item.highlight && !isActive ? 'border border-blue-500/20 bg-blue-950/20 text-blue-300' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className={`w-4 h-4 shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
            {!collapsed && (
              <span className="truncate flex-1 flex items-center justify-between">
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/30 text-blue-300 font-bold uppercase tracking-wider">
                    AI
                  </span>
                )}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer System Status */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>AI Match Engine Active</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-500">Live scoring & verified sources synced</p>
        </div>
      )}
    </aside>
  );
};
