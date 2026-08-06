import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { PriorityDistributionStat } from '../types';
import { PriorityLevel } from '@/features/queue/types';
import { PieChart as PieIcon } from 'lucide-react';

export interface PriorityDistributionChartProps {
  data: PriorityDistributionStat[];
}

const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  NORMAL: '#94a3b8',
  SENIOR_CITIZEN: '#3b82f6',
  VIP: '#a855f7',
  EMERGENCY: '#f43f5e',
};

export const PriorityDistributionChart: React.FC<PriorityDistributionChartProps> = ({
  data = [],
}) => {
  const chartData = data.map((d) => ({
    name: d.priority,
    value: d.count,
    percentage: d.percentage,
  }));

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-400" /> Priority Distribution
          </h3>
          <p className="text-xs text-slate-400">Customer queue priority levels breakdown</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#f8fafc',
              }}
              formatter={(val: any, name: any, entry: any) => [
                `${val} Tickets (${entry.payload.percentage}%)`,
                name,
              ]}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name as PriorityLevel] || '#64748b'} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
