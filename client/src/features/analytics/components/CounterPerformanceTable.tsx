import React from 'react';
import { CounterPerformanceStat } from '../types';
import { Monitor, Clock } from 'lucide-react';

export interface CounterPerformanceTableProps {
  data: CounterPerformanceStat[];
}

export const CounterPerformanceTable: React.FC<CounterPerformanceTableProps> = ({ data = [] }) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Monitor className="w-4 h-4 text-brand-400" /> Counter Desk Performance
          </h3>
          <p className="text-xs text-slate-400">Total served tickets & average handling time per counter</p>
        </div>

        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
          {data.length} Counters
        </span>
      </div>

      {data.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
          No counter activity recorded today.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                <th className="py-2.5 px-3">Counter</th>
                <th className="py-2.5 px-3 text-center">Served Count</th>
                <th className="py-2.5 px-3 text-right">Avg Handling Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.map((c) => (
                <tr key={c.counterId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{c.counterName}</span>
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-950 border border-slate-800 text-brand-400 font-bold">
                        #{c.counterNumber}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-400 font-mono">
                    {c.servedCount}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {c.avgHandlingTimeMins} mins
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
