import React from 'react';

export interface ServiceBadgeProps {
  code: string;
  name?: string;
}

export const ServiceBadge: React.FC<ServiceBadgeProps> = ({ code, name }) => {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-900 border border-slate-800 text-indigo-300"
      title={name}
    >
      {code}
    </span>
  );
};
