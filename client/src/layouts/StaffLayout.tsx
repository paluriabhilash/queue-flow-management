import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Monitor, Power } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const StaffLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/90 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/staff" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center font-bold text-white shadow-lg shadow-amber-600/30">
              S
            </div>
            <span className="text-xl font-bold text-white">QueueFlow Staff</span>
          </Link>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950 border border-amber-800 text-amber-400">
            Counter Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Monitor className="w-4 h-4 text-amber-400" />
            <span>{user?.fullName || 'Staff Member'}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors font-semibold"
          >
            <Power className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};
