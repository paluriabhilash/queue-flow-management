import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, GitBranch, Layers, Settings, Monitor, Users, ShieldAlert, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Org Profile', path: '/admin/organization/profile', icon: Building2 },
    { label: 'Org Settings', path: '/admin/organization/settings', icon: Settings },
    { label: 'Branches', path: '/admin/branches', icon: GitBranch },
    { label: 'Services', path: '/admin/services', icon: Layers },
    { label: 'Departments', path: '/admin/departments', icon: Building2 },
    { label: 'Counters', path: '/admin/counters', icon: Monitor },
    { label: 'Staff Accounts', path: '/admin/staff', icon: Users },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-900/60 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-brand-600/30">
              Q
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">QueueFlow</span>
              <span className="block text-[10px] text-brand-400 font-semibold uppercase tracking-widest">
                Admin Console
              </span>
            </div>
          </Link>

          <nav className="space-y-1 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all',
                    isActive
                      ? 'bg-brand-600/15 text-brand-400 border border-brand-500/30 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="truncate">
              <span className="block font-semibold text-slate-200 truncate">{user?.fullName}</span>
              <span className="text-[10px] text-slate-500 font-mono">{user?.role}</span>
            </div>
            <ShieldAlert className="w-4 h-4 text-brand-400 shrink-0" />
          </div>

          <button
            type="button"
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
