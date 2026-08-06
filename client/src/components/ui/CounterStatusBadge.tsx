import React from 'react';
import { clsx } from 'clsx';
import { CounterStatus } from '@/features/counter/types';

export interface CounterStatusBadgeProps {
  status?: CounterStatus | string;
  className?: string;
}

export const CounterStatusBadge: React.FC<CounterStatusBadgeProps> = ({ status = 'CLOSED', className }) => {
  const normalized = (status || 'CLOSED').toUpperCase();

  const styles = {
    OPEN: 'bg-emerald-950/80 border-emerald-800/80 text-emerald-400',
    PAUSED: 'bg-amber-950/80 border-amber-800/80 text-amber-300',
    CLOSED: 'bg-slate-900/80 border-slate-800 text-slate-400',
    MAINTENANCE: 'bg-rose-950/80 border-rose-800/80 text-rose-400 font-bold',
  }[normalized] || 'bg-slate-900/80 border-slate-800 text-slate-400';

  const dotColors = {
    OPEN: 'bg-emerald-400 animate-pulse',
    PAUSED: 'bg-amber-400',
    CLOSED: 'bg-slate-500',
    MAINTENANCE: 'bg-rose-400',
  }[normalized] || 'bg-slate-500';

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border',
        styles,
        className
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors)} />
      {normalized}
    </span>
  );
};
