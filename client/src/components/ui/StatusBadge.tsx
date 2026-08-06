import React from 'react';
import { clsx } from 'clsx';

export interface StatusBadgeProps {
  status?: boolean | string;
  activeText?: string;
  inactiveText?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  activeText = 'Active',
  inactiveText = 'Inactive',
  className,
}) => {
  const isActive = status === true || status === 'ACTIVE' || status === 'OPEN';

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border',
        isActive
          ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-400'
          : 'bg-rose-950/80 border-rose-800/80 text-rose-400',
        className
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400')} />
      {isActive ? activeText : inactiveText}
    </span>
  );
};
