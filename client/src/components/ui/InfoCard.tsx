import React from 'react';
import { clsx } from 'clsx';

export interface InfoCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
}) => {
  return (
    <div
      className={clsx(
        'p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg backdrop-blur-md flex flex-col justify-between space-y-3 transition-all hover:border-slate-700',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        {icon && <div className="p-2 rounded-xl bg-slate-800/80 text-brand-400">{icon}</div>}
      </div>

      <div className="space-y-1">
        <div className="text-3xl font-extrabold text-white tracking-tight">{value}</div>
        {description && <p className="text-xs text-slate-400">{description}</p>}
      </div>

      {trend && (
        <div className="pt-2 border-t border-slate-800/60 flex items-center gap-1.5 text-xs">
          <span
            className={clsx(
              'font-bold px-1.5 py-0.5 rounded-md',
              trend.isPositive ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
            )}
          >
            {trend.value}
          </span>
          <span className="text-slate-500">vs last period</span>
        </div>
      )}
    </div>
  );
};
