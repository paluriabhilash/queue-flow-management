import React from 'react';
import { TicketTokenItem } from '@/features/queue/types';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { ActionButtonGroup } from './ActionButtonGroup';
import { User, Phone, Layers, BellRing } from 'lucide-react';

export interface CurrentTokenCardProps {
  token: TicketTokenItem | null;
  onStart: () => void;
  onComplete: () => void;
  onSkip: () => void;
  isPending?: boolean;
}

export const CurrentTokenCard: React.FC<CurrentTokenCardProps> = ({
  token,
  onStart,
  onComplete,
  onSkip,
  isPending = false,
}) => {
  if (!token) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
          <BellRing className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-300">No Active Ticket at Counter</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Click <strong className="text-brand-400">"CALL NEXT TOKEN"</strong> to dispatch the highest priority waiting customer.
        </p>
      </div>
    );
  }

  const isCalled = token.status === 'CALLED';
  const isServing = token.status === 'SERVING';

  return (
    <div
      className={`p-6 rounded-2xl border shadow-xl backdrop-blur-md space-y-6 ${
        isCalled
          ? 'bg-amber-950/30 border-amber-500/60 ring-2 ring-amber-500/20'
          : isServing
          ? 'bg-emerald-950/30 border-emerald-500/60 ring-2 ring-emerald-500/20'
          : 'bg-slate-900/90 border-slate-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-black font-mono text-white tracking-tight">{token.tokenNumber}</span>
            <PriorityBadge priority={token.priority} />
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
            <Layers className="w-3.5 h-3.5 text-brand-400" /> {token.service?.name || 'Queue Service'}
          </p>
        </div>

        <div className="text-right">
          {isCalled && (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-950 text-amber-300 border border-amber-800 inline-block animate-pulse">
              CALLED TO COUNTER
            </span>
          )}
          {isServing && (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800 inline-block">
              SERVICE IN PROGRESS
            </span>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
        <div className="space-y-1">
          <span className="text-slate-500 block text-[11px]">Customer Name</span>
          <span className="font-bold text-white text-sm flex items-center gap-1.5">
            <User className="w-4 h-4 text-brand-400" />
            {token.customer?.fullName || token.customerName || 'Walk-in Customer'}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-slate-500 block text-[11px]">Contact Phone</span>
          <span className="font-mono text-slate-200 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            {token.customer?.phone || token.customerPhone || 'N/A'}
          </span>
        </div>
      </div>

      {/* Operator Action Buttons */}
      <ActionButtonGroup
        status={token.status}
        onStart={onStart}
        onComplete={onComplete}
        onSkip={onSkip}
        isPending={isPending}
      />
    </div>
  );
};
