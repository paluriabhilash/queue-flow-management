import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { ServicePerformanceStat } from '../types';
import { Layers } from 'lucide-react';

export interface ServicePerformanceChartProps {
  data: ServicePerformanceStat[];
}

export const ServicePerformanceChart: React.FC<ServicePerformanceChartProps> = ({ data = [] }) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" /> Service Performance
          </h3>
          <p className="text-xs text-slate-400">Total served count & average service duration (mins)</p>
        </div>

        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
          {data.length} Services
        </span>
      </div>

      {data.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
          No service performance metrics recorded today.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="serviceCode" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="totalServed" name="Total Served" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgServiceDurationMins" name="Avg Service Duration (m)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
