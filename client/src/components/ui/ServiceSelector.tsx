import React from 'react';
import { Layers, Clock } from 'lucide-react';
import { useServices } from '@/features/service/hooks/useServiceQueries';
import { PriorityBadge } from '@/components/ui/PriorityBadge';

export interface ServiceSelectorProps {
  branchId: string;
  selectedServiceId?: string;
  onSelectService: (serviceId: string) => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  branchId,
  selectedServiceId,
  onSelectService,
}) => {
  const { data: services = [], isLoading } = useServices(branchId);
  const activeServices = services.filter((s) => s.isActive);

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-16 bg-slate-900/80 border border-slate-800 rounded-2xl" />
        <div className="h-16 bg-slate-900/80 border border-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (activeServices.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
        No queue services currently active at this branch location.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {activeServices.map((service) => {
        const isSelected = selectedServiceId === service.id;
        return (
          <div
            key={service.id}
            onClick={() => onSelectService(service.id)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
              isSelected
                ? 'bg-brand-950/70 border-brand-500/80 shadow-lg shadow-brand-600/10 ring-2 ring-brand-500/30'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-400" />
                <span className="font-bold text-slate-100 text-sm">{service.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 text-brand-400">
                  {service.code}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">
                {service.description || 'General queue service for walk-in and online tokens.'}
              </p>
            </div>

            <div className="text-right space-y-1 shrink-0">
              <span className="text-xs text-slate-300 font-mono font-semibold flex items-center justify-end gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> ~{service.avgServiceTimeMins}m
              </span>
              <PriorityBadge priority={service.priority} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
