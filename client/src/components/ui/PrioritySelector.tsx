import React from 'react';
import { PriorityLevel } from '@/features/service/types';
import { Shield, Sparkles, HeartPulse, UserCheck } from 'lucide-react';

export interface PrioritySelectorProps {
  selectedPriority: PriorityLevel;
  onSelectPriority: (priority: PriorityLevel) => void;
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  selectedPriority,
  onSelectPriority,
}) => {
  const options: { value: PriorityLevel; label: string; description: string; icon: React.ReactNode; color: string }[] = [
    {
      value: 'NORMAL',
      label: 'Standard Priority',
      description: 'Standard queue ticket for regular appointments',
      icon: <UserCheck className="w-5 h-5 text-slate-400" />,
      color: 'border-slate-700 bg-slate-900',
    },
    {
      value: 'SENIOR_CITIZEN',
      label: 'Senior Citizen / PWD',
      description: 'Dedicated priority queue for elderly, pregnant, or PWD customers',
      icon: <HeartPulse className="w-5 h-5 text-indigo-400" />,
      color: 'border-indigo-800 bg-indigo-950/40',
    },
    {
      value: 'VIP',
      label: 'VIP Priority',
      description: 'Fast-track priority token for registered VIP members',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-800 bg-purple-950/40',
    },
    {
      value: 'EMERGENCY',
      label: 'Emergency Priority',
      description: 'Top queue dispatch priority for urgent care / triage cases',
      icon: <Shield className="w-5 h-5 text-rose-400" />,
      color: 'border-rose-800 bg-rose-950/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt) => {
        const isSelected = selectedPriority === opt.value;
        return (
          <div
            key={opt.value}
            onClick={() => onSelectPriority(opt.value)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
              isSelected
                ? 'bg-brand-950/80 border-brand-500 shadow-lg shadow-brand-600/10 ring-2 ring-brand-500/30'
                : `${opt.color} hover:border-slate-600`
            }`}
          >
            <div className="flex items-center gap-2.5">
              {opt.icon}
              <span className="font-bold text-slate-100 text-sm">{opt.label}</span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">{opt.description}</p>
          </div>
        );
      })}
    </div>
  );
};
