import React from 'react';
import { TicketTokenItem } from '@/features/queue/types';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Users } from 'lucide-react';

export interface NextTokensListProps {
  tokens: TicketTokenItem[];
}

export const NextTokensList: React.FC<NextTokensListProps> = ({ tokens = [] }) => {
  const displayTokens = tokens.slice(0, 5);

  return (
    <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-400" /> Next In Queue
        </h3>
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
          Top 5 Waiting
        </span>
      </div>

      {displayTokens.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
          No waiting customers currently in line.
        </div>
      ) : (
        <div className="space-y-3">
          {displayTokens.map((token, index) => (
            <div
              key={token.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-4 text-xs hover:bg-slate-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs font-black text-brand-400 flex items-center justify-center">
                  #{index + 1}
                </span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black font-mono text-white tracking-tight">
                      {token.tokenNumber}
                    </span>
                    <PriorityBadge priority={token.priority} />
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    {token.service?.name || 'General Service'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800 inline-block font-mono">
                  WAITING
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
