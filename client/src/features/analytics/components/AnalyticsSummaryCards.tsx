import React from 'react';
import { AnalyticsSummary } from '../types';
import { Ticket, CheckCircle2, XCircle, FastForward, Clock, Timer } from 'lucide-react';

export interface AnalyticsSummaryCardsProps {
  summary: AnalyticsSummary;
}

export const AnalyticsSummaryCards: React.FC<AnalyticsSummaryCardsProps> = ({ summary }) => {
  const cards = [
    {
      title: 'Total Generated',
      value: summary.totalTokensGenerated,
      unit: 'Tickets',
      icon: Ticket,
      color: 'text-brand-400',
      bgColor: 'bg-brand-950/60',
      borderColor: 'border-brand-800/60',
    },
    {
      title: 'Completed Services',
      value: summary.completedTokens,
      unit: 'Tokens',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/60',
      borderColor: 'border-emerald-800/60',
    },
    {
      title: 'Cancelled Tokens',
      value: summary.cancelledTokens,
      unit: 'Tokens',
      icon: XCircle,
      color: 'text-rose-400',
      bgColor: 'bg-rose-950/60',
      borderColor: 'border-rose-800/60',
    },
    {
      title: 'Skipped No-Shows',
      value: summary.skippedTokens,
      unit: 'Tokens',
      icon: FastForward,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/60',
      borderColor: 'border-amber-800/60',
    },
    {
      title: 'Avg Waiting Time',
      value: `${summary.avgWaitTimeMins}m`,
      unit: 'Minutes',
      icon: Clock,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-950/60',
      borderColor: 'border-indigo-800/60',
    },
    {
      title: 'Avg Service Duration',
      value: `${summary.avgServiceDurationMins}m`,
      unit: 'Minutes',
      icon: Timer,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-950/60',
      borderColor: 'border-cyan-800/60',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-4 rounded-2xl ${c.bgColor} border ${c.borderColor} shadow-lg backdrop-blur-md space-y-2`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                {c.title}
              </span>
              <Icon className={`w-4 h-4 ${c.color}`} />
            </div>

            <div>
              <div className={`text-2xl font-black font-mono tracking-tight text-white`}>
                {c.value}
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">{c.unit} Today</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
