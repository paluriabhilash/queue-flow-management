import React from 'react';
import { Clock } from 'lucide-react';

export interface EstimatedWaitCardProps {
  estimatedWaitMins?: number;
  status?: string;
}

export const EstimatedWaitCard: React.FC<EstimatedWaitCardProps> = ({
  estimatedWaitMins = 10,
  status = 'WAITING',
}) => {
  const isServing = status === 'SERVING';
  const isCompleted = status === 'COMPLETED';

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-400" /> Estimated Wait Time
        </span>
      </div>

      <div>
        {isCompleted ? (
          <div className="text-2xl font-bold text-slate-400">Completed</div>
        ) : isServing ? (
          <div className="text-2xl font-bold text-emerald-400">In Progress</div>
        ) : (
          <div>
            <div className="text-3xl font-black font-mono text-amber-300 tracking-tight">
              ~{estimatedWaitMins} <span className="text-lg font-normal text-slate-400">Mins</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Calculated based on current counter speed</p>
          </div>
        )}
      </div>
    </div>
  );
};
