import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Ticket, Clock, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const CustomerLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-600/30">
            Q
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-brand-400 bg-clip-text text-transparent">
            QueueFlow
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-950 border border-brand-800 text-brand-400 font-semibold">
            Customer Portal
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            to="/customer/get-token"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <Ticket className="w-4 h-4 text-brand-400" />
            Book Token
          </Link>
          <Link
            to="/customer/dashboard"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            My Tokens
          </Link>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <div className="text-right hidden sm:block">
                <span className="block text-xs font-semibold text-slate-200">{user.fullName}</span>
                <span className="block text-[10px] text-brand-400 font-mono">{user.role}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-rose-950/50 border border-rose-800/60 hover:border-rose-700 transition-all text-rose-400 hover:text-rose-300 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="flex items-center gap-1.5 text-sm px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 transition-all text-white font-semibold shadow-md shadow-brand-600/20"
            >
              <User className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 px-6 py-4 text-center text-xs text-slate-500">
        QueueFlow Digital Queue System &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};
