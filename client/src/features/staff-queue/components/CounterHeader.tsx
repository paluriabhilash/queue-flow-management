import React from 'react';
import { CounterItem } from '@/features/counter/types';
import { CounterStatusBadge } from '@/components/ui/CounterStatusBadge';
import { ServiceBadge } from '@/components/ui/ServiceBadge';
import { Monitor, GitBranch, UserCheck, Layers } from 'lucide-react';

export interface CounterHeaderProps {
  counter: CounterItem;
  operatorName?: string;
}

export const CounterHeader: React.FC<CounterHeaderProps> = ({ counter, operatorName }) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Monitor className="w-6 h-6 text-brand-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{counter.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-950 border border-brand-800 text-brand-400">
              #{counter.number}
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
            <GitBranch className="w-3.5 h-3.5 text-slate-500" />
            Branch Location: <strong className="text-slate-200">{counter.branch?.name || 'Central Location'}</strong>
          </p>
        </div>

        <CounterStatusBadge status={counter.status} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Operator Duty: <strong className="text-emerald-400 font-semibold">{operatorName || 'Active Operator'}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-slate-400 mr-1">Supported Services:</span>
          <div className="flex flex-wrap gap-1">
            {counter.counterServices && counter.counterServices.length > 0 ? (
              counter.counterServices.map((cs) => (
                <ServiceBadge key={cs.id} code={cs.service.code} name={cs.service.name} />
              ))
            ) : (
              <span className="text-slate-500 text-xs italic">No mapped services</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
