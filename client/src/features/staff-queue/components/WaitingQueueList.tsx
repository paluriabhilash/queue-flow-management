import React from 'react';
import { TicketTokenItem } from '@/features/queue/types';
import { QueueTokenRow } from './QueueTokenRow';
import { Users } from 'lucide-react';

export interface WaitingQueueListProps {
  tokens: TicketTokenItem[];
  totalWaitingCount: number;
}

export const WaitingQueueList: React.FC<WaitingQueueListProps> = ({
  tokens = [],
  totalWaitingCount = 0,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-400" /> Waiting Queue Line
          </h3>
          <p className="text-xs text-slate-400">Customers waiting for dispatch in priority order</p>
        </div>

        <span className="text-xs text-slate-400 font-mono font-bold px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800">
          Total: {totalWaitingCount} waiting
        </span>
      </div>

      {tokens.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
          No waiting customers currently in line for this counter's services.
        </div>
      ) : (
        <div className="space-y-2">
          {tokens.map((token, index) => (
            <QueueTokenRow key={token.id} token={token} position={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
