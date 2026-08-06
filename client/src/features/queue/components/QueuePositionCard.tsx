import React from 'react';
import { Users, Ticket } from 'lucide-react';

export interface QueuePositionCardProps {
  position?: number;
  queueAheadCount?: number;
  status?: string;
}

export const QueuePositionCard: React.FC<QueuePositionCardProps> = ({
  position = 1,
  queueAheadCount = 0,
  status = 'WAITING',
}) => {
  const isCalledOrServing = status === 'CALLED' || status === 'SERVING';

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Ticket className="w-4 h-4 text-brand-400" /> Queue Position
        </span>
        <span className="text-[10px] text-slate-500 font-mono">Live Tracking</span>
      </div>

      <div className="flex items-baseline justify-between">
        {isCalledOrServing ? (
          <div className="text-2xl font-black text-emerald-400 tracking-tight flex items-center gap-2">
            Proceed to Counter!
          </div>
        ) : (
          <div>
            <div className="text-4xl font-black font-mono text-white tracking-tight">#{position}</div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-brand-400" />
              {queueAheadCount === 0
                ? 'You are next in line!'
                : `${queueAheadCount} ${queueAheadCount === 1 ? 'person' : 'people'} ahead of you`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
