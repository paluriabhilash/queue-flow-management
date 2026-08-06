import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Clock, ShieldCheck, Zap, Users } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col lg:flex-row text-slate-100 overflow-x-hidden">
      {/* Left Column: SaaS Branding & Features (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 p-12 flex-col justify-between overflow-hidden border-r border-slate-800/60">
        {/* Glow Effects */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-brand-600/40">
              Q
            </div>
            <span className="text-2xl font-black tracking-tight text-white">QueueFlow</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-800/80 text-brand-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-brand-400" />
            Next-Gen Queue Management
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Replace waiting lines with intelligent digital queues.
          </h1>

          <p className="text-slate-400 text-base leading-relaxed">
            Real-time live position tracking, accurate wait time estimation, and role-based staff counters built for hospitals, banks, universities, and service centers.
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Live Queue Tracking</h4>
                <p className="text-[11px] text-slate-400">Instant position updates</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-brand-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Multi-Role Security</h4>
                <p className="text-[11px] text-slate-400">Customer, Staff & Admin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-8 border-t border-slate-800/50">
          <span>&copy; {new Date().getFullYear()} QueueFlow Inc.</span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" /> Multi-Tenant System
          </span>
        </div>
      </div>

      {/* Right Column: Authentication Form Area */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Header Logo */}
        <div className="lg:hidden absolute top-6 left-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-600/30">
              Q
            </div>
            <span className="text-xl font-extrabold text-white">QueueFlow</span>
          </Link>
        </div>

        <div className="w-full max-w-md my-auto pt-10 lg:pt-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
