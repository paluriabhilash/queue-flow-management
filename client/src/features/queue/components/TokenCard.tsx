import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketTokenItem } from '../types';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { GitBranch, Clock, ArrowRight, Layers } from 'lucide-react';

export interface TokenCardProps {
  token: TicketTokenItem;
}

export const TokenCard: React.FC<TokenCardProps> = ({ token }) => {
  const navigate = useNavigate();

  const isCalled = token.status === 'CALLED';
  const isServing = token.status === 'SERVING';

  return (
    <div
      onClick={() => navigate(`/customer/token/${token.id}`)}
      className={`p-6 rounded-2xl border cursor-pointer transition-all space-y-4 shadow-xl backdrop-blur-md ${
        isCalled || isServing
          ? 'bg-emerald-950/40 border-emerald-500/80 hover:border-emerald-400 ring-2 ring-emerald-500/20'
          : 'bg-slate-900/80 border-slate-800 hover:border-brand-500/60 hover:bg-slate-900'
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-white">{token.tokenNumber}</span>
            <PriorityBadge priority={token.priority} />
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-brand-400" />
            {token.service?.name || 'General Service'}
          </p>
        </div>

        <div className="text-right">
          {isCalled ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse">
              CALLED TO COUNTER
            </span>
          ) : isServing ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-950 text-indigo-400 border border-indigo-800">
              IN SERVICE
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950 text-brand-400 border border-slate-800 font-mono">
              WAITING
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs text-slate-300">
        <div className="space-y-1">
          <span className="text-slate-500 block text-[11px]">Branch Location</span>
          <span className="font-semibold text-slate-200 flex items-center gap-1 truncate">
            <GitBranch className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            {token.queue?.branch?.name || 'Central Location'}
          </span>
        </div>

        <div className="space-y-1 text-right">
          <span className="text-slate-500 block text-[11px]">Est. Waiting Time</span>
          <span className="font-mono font-bold text-amber-400 text-sm flex items-center justify-end gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> ~{token.estimatedWaitTime || 10}m
          </span>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between text-xs text-brand-400 font-semibold border-t border-slate-800/80">
        <span>Track Live Queue Status</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
};
