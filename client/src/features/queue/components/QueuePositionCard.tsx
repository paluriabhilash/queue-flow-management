import React from 'react';
import { Users, Ticket, ArrowRight, CheckCircle, Sparkles, UserCheck } from 'lucide-react';
import { TokenStatus } from '../types';

export interface QueuePositionCardProps {
  position?: number;
  queueAheadCount?: number;
  status?: TokenStatus | string;
  computedStatus?: TokenStatus;
}

export const QueuePositionCard: React.FC<QueuePositionCardProps> = ({
  position = 1,
  queueAheadCount = 0,
  status = 'WAITING',
  computedStatus,
}) => {
  const activeStatus = computedStatus || (status as TokenStatus) || 'WAITING';

  const isCalled = activeStatus === 'CALLED';
  const isServing = activeStatus === 'SERVING';
  const isCompleted = activeStatus === 'COMPLETED';

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Ticket className="w-4 h-4 text-brand-400" /> Queue Status & Position
        </span>
        <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full font-mono font-bold">
          Live Tracking
        </span>
      </div>

      <div className="flex items-baseline justify-between">
        {isCompleted ? (
          <div className="text-2xl font-black text-slate-300 tracking-tight flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-emerald-400" /> Ticket Finalized
          </div>
        ) : isServing ? (
          <div className="space-y-1">
            <div className="text-2xl font-black text-emerald-400 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" /> On Process / In Service
            </div>
            <p className="text-xs text-slate-400">Currently being served at counter desk.</p>
          </div>
        ) : isCalled ? (
          <div className="space-y-1">
            <div className="text-2xl font-black text-emerald-300 tracking-tight flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-300 animate-bounce" /> Called to Counter #1
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-1">
              Proceed to counter now! <ArrowRight className="w-4 h-4 text-emerald-400 animate-pulse" />
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-black font-mono text-white tracking-tight">#{position}</div>
              {queueAheadCount === 0 && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-brand-950 text-brand-300 border border-brand-800 animate-pulse">
                  🌟 Next in Line!
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
              <Users className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              {queueAheadCount === 0
                ? 'You are next! Please stay ready.'
                : `${queueAheadCount} ${queueAheadCount === 1 ? 'person' : 'people'} ahead of you in queue`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
