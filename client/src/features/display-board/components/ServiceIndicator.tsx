import React from 'react';
import { Wifi, Tv } from 'lucide-react';

export interface ServiceIndicatorProps {
  branchName: string;
  isConnected: boolean;
  currentTime: Date;
}

export const ServiceIndicator: React.FC<ServiceIndicatorProps> = ({
  branchName,
  isConnected,
  currentTime,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
          <Tv className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-400">
            Public Queue Display
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">{branchName}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <span className="text-2xl font-black font-mono text-white tracking-tight">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="h-8 w-px bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5 shadow-lg shadow-emerald-950/50">
              <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" /> LIVE SYNC
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-amber-400" /> OFFLINE FALLBACK
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
