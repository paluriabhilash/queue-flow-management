import React from 'react';
import { TokenStatus } from '../types';
import { CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react';

export interface StatusTimelineProps {
  status: TokenStatus;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ status }) => {
  const steps: { key: TokenStatus | 'ISSUED'; label: string; desc: string }[] = [
    { key: 'WAITING', label: 'Ticket Issued', desc: 'In queue line' },
    { key: 'CALLED', label: 'Called at Counter', desc: 'Proceed to desk' },
    { key: 'SERVING', label: 'In Service', desc: 'Being served' },
    { key: 'COMPLETED', label: 'Completed', desc: 'Finished' },
  ];

  const getStepState = (stepKey: string) => {
    if (status === 'CANCELLED' || status === 'SKIPPED') {
      if (status === 'SKIPPED' && stepKey === 'CALLED') return 'current';
      return 'past';
    }

    const orderMap: Record<string, number> = {
      WAITING: 1,
      CALLED: 2,
      SERVING: 3,
      COMPLETED: 4,
    };

    const currentOrder = orderMap[status] || 1;
    const stepOrder = orderMap[stepKey] || 1;

    if (stepOrder < currentOrder) return 'completed';
    if (stepOrder === currentOrder) return 'current';
    return 'upcoming';
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl backdrop-blur-md space-y-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live Status Timeline</h4>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {steps.map((s) => {
          const state = getStepState(s.key);
          return (
            <div
              key={s.key}
              className={`p-3.5 rounded-xl border space-y-1 transition-all ${
                state === 'completed'
                  ? 'bg-brand-950/40 border-brand-800/60 text-brand-300'
                  : state === 'current'
                  ? 'bg-brand-900/40 border-brand-500 text-white shadow-md shadow-brand-500/10'
                  : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                {state === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : state === 'current' ? (
                  <Clock className="w-4 h-4 text-brand-400 animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600" />
                )}
                <ArrowRight className="w-3.5 h-3.5 text-slate-700 hidden sm:block" />
              </div>

              <strong className="block text-xs font-bold">{s.label}</strong>
              <span className="text-[11px] block">{s.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
