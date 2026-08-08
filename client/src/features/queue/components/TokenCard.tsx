import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketTokenItem } from '../types';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { useLiveWaitCountdown } from '../hooks/useLiveWaitCountdown';
import { GitBranch, Clock, ArrowRight, Layers, Users, Activity, CheckCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { useDeleteToken } from '../hooks/useQueueQueries';

export interface TokenCardProps {
  token: TicketTokenItem;
}

export const TokenCard: React.FC<TokenCardProps> = ({ token }) => {
  const navigate = useNavigate();
  const deleteMutation = useDeleteToken();

  const { formattedCountdown, formattedElapsed, computedStatus } = useLiveWaitCountdown({
    estimatedWaitMins: token.estimatedWaitTime || 1,
    createdAt: token.createdAt,
    calledAt: token.calledAt,
    servedAt: token.servedAt,
    completedAt: token.completedAt,
    status: token.status,
    avgServiceTimeMins: token.service?.avgServiceTimeMins || 1,
  });

  const isCalled = computedStatus === 'CALLED';
  const isServing = computedStatus === 'SERVING';
  const isCompleted = computedStatus === 'COMPLETED';
  const isCancelled = computedStatus === 'CANCELLED' || computedStatus === 'SKIPPED';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(token.id);
  };

  return (
    <div
      onClick={() => navigate(`/customer/token/${token.id}`)}
      className={`p-6 rounded-2xl border cursor-pointer transition-all space-y-4 shadow-xl backdrop-blur-md ${
        isCalled || isServing
          ? 'bg-emerald-950/40 border-emerald-500/80 hover:border-emerald-400 ring-2 ring-emerald-500/20'
          : isCompleted
          ? 'bg-slate-900/70 border-emerald-900/60 hover:border-emerald-500/60'
          : 'bg-slate-900/80 border-slate-800 hover:border-brand-500/60 hover:bg-slate-900'
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-white">
              {token.tokenNumber}
            </span>
            <PriorityBadge priority={token.priority} />
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-brand-400" />
            {token.service?.name || 'General Service'}
          </p>
        </div>

        <div className="text-right flex items-center gap-2">
          {isCompleted ? (
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-700 font-mono shadow-sm flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> COMPLETED
            </span>
          ) : isServing ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-950 text-indigo-400 border border-indigo-800 animate-pulse">
              IN SERVICE
            </span>
          ) : isCalled ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse">
              CALLED TO COUNTER
            </span>
          ) : isCancelled ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-950/80 text-rose-400 border border-rose-800 font-mono">
              {token.status}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950 text-brand-400 border border-slate-800 font-mono">
              WAITING
            </span>
          )}

          {(isCompleted || isCancelled) && (
            <button
              type="button"
              onClick={handleDelete}
              title="Delete Completed Ticket"
              disabled={deleteMutation.isPending}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/80 text-slate-400 hover:text-rose-300 transition-colors shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
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
          {token.queuePosition !== undefined && computedStatus === 'WAITING' && (
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 pt-0.5">
              <Users className="w-3 h-3 text-brand-400" /> Position #{token.queuePosition}
            </span>
          )}
        </div>

        <div className="space-y-1 text-right">
          <span className="text-slate-500 block text-[11px]">
            {isServing ? 'Serving Duration' : isCompleted ? 'Status' : 'Est. Countdown'}
          </span>
          <span className="font-mono font-bold text-amber-400 text-sm flex items-center justify-end gap-1">
            {isCompleted ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Finished ({formattedElapsed})
              </span>
            ) : isServing ? (
              <span className="text-emerald-400">{formattedElapsed}</span>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{formattedCountdown}</span>
                <Activity className="w-3 h-3 text-amber-400 animate-pulse ml-0.5" />
              </>
            )}
          </span>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between text-xs text-brand-400 font-semibold border-t border-slate-800/80">
        <span>{isCompleted ? 'View Completed Details' : 'Track Live Queue Status'}</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
};
