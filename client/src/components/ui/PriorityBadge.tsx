import React from 'react';
import { clsx } from 'clsx';
import { PriorityLevel } from '@/features/service/types';

export interface PriorityBadgeProps {
  priority?: PriorityLevel | string;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority = 'NORMAL', className }) => {
  const normalized = (priority || 'NORMAL').toUpperCase();

  const styles = {
    NORMAL: 'bg-slate-800 border-slate-700 text-slate-300',
    SENIOR_CITIZEN: 'bg-indigo-950 border-indigo-800 text-indigo-300',
    HIGH: 'bg-amber-950 border-amber-800 text-amber-300',
    EMERGENCY: 'bg-rose-950 border-rose-800 text-rose-300 font-bold animate-pulse',
    VIP: 'bg-purple-950 border-purple-800 text-purple-300 font-bold',
  }[normalized] || 'bg-slate-800 border-slate-700 text-slate-300';

  const labels = {
    NORMAL: 'Normal',
    SENIOR_CITIZEN: 'Senior / Disability',
    HIGH: 'High Priority',
    EMERGENCY: 'EMERGENCY',
    VIP: 'VIP Priority',
  }[normalized] || normalized;

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border',
        styles,
        className
      )}
    >
      {labels}
    </span>
  );
};
