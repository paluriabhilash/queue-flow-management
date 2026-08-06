import React from 'react';
import { TicketTokenItem } from '@/features/queue/types';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { BellRing, Monitor, Layers } from 'lucide-react';

export interface CurrentServingCardProps {
  token: TicketTokenItem;
  isHighlighted?: boolean;
}

export const CurrentServingCard: React.FC<CurrentServingCardProps> = ({
  token,
  isHighlighted = false,
}) => {
  const counterNum = token.counter?.number || 1;
  const isCalled = token.status === 'CALLED';

  return (
    <div
      className={`p-8 rounded-3xl border shadow-2xl transition-all duration-500 space-y-6 relative overflow-hidden ${
        isHighlighted
          ? 'bg-amber-950/40 border-amber-400 ring-4 ring-amber-500/30 scale-[1.02] shadow-amber-500/20'
          : isCalled
          ? 'bg-emerald-950/40 border-emerald-500/80 ring-2 ring-emerald-500/20'
          : 'bg-slate-900/90 border-slate-800'
      }`}
    >
      {/* Top Tag & Status */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
          <Layers className="w-4 h-4 text-brand-400" />
          <span>{token.service?.name || 'General Service'}</span>
        </div>

        <PriorityBadge priority={token.priority} />
      </div>

      {/* Main Token Display & Counter Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6 py-2">
        <div className="space-y-1">
          <span className="text-[11px] uppercase tracking-widest font-bold text-slate-400 block">
            Token Ticket Number
          </span>
          <div className="text-6xl lg:text-7xl font-black font-mono text-white tracking-tighter drop-shadow-md">
            {token.tokenNumber}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 text-right space-y-1">
          <span className="text-[11px] uppercase tracking-widest font-bold text-slate-400 flex items-center justify-end gap-1.5">
            <Monitor className="w-4 h-4 text-brand-400" /> Proceed To
          </span>
          <div className="text-4xl lg:text-5xl font-black font-mono text-brand-400 tracking-tight">
            Counter #{counterNum}
          </div>
        </div>
      </div>

      {/* Status Footer Tag */}
      <div className="flex items-center justify-between pt-2 text-xs">
        <span className="text-slate-400 flex items-center gap-1.5 font-medium">
          <BellRing className={`w-4 h-4 ${isCalled ? 'text-amber-400 animate-bounce' : 'text-emerald-400'}`} />
          {isCalled ? 'Now Calling...' : 'Now Serving'}
        </span>

        <span className="text-[11px] font-mono text-slate-500">
          Called: {token.calledAt ? new Date(token.calledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
        </span>
      </div>
    </div>
  );
};
