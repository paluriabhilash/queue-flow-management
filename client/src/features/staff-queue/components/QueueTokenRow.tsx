import React from 'react';
import { TicketTokenItem } from '@/features/queue/types';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Clock } from 'lucide-react';

export interface QueueTokenRowProps {
  token: TicketTokenItem;
  position: number;
}

export const QueueTokenRow: React.FC<QueueTokenRowProps> = ({ token, position }) => {
  return (
    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-4 text-xs hover:bg-slate-900/60 transition-colors">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] font-bold text-slate-400 flex items-center justify-center">
          #{position}
        </span>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 text-sm font-mono">{token.tokenNumber}</span>
            <PriorityBadge priority={token.priority} />
          </div>
          <span className="text-[11px] text-slate-400 block">{token.service?.name || 'General Service'}</span>
        </div>
      </div>

      <div className="text-right space-y-0.5">
        <span className="text-[11px] font-mono text-slate-400 flex items-center justify-end gap-1">
          <Clock className="w-3 h-3 text-slate-500" />
          {new Date(token.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">WAITING</span>
      </div>
    </div>
  );
};
