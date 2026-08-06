import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useServiceDetails } from '@/features/service/hooks/useServiceQueries';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { ArrowLeft, Layers, Clock, GitBranch, Shield, Ticket, Hash } from 'lucide-react';

export const ServiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: service, isLoading, isError, error, refetch } = useServiceDetails(id);

  if (isLoading) {
    return <LoadingState message="Loading service details..." rows={4} />;
  }

  if (isError || !service) {
    return (
      <ErrorState
        title="Failed to load Service Profile"
        message={error?.message || 'Service profile not found.'}
        onRetry={refetch}
      />
    );
  }

  const branch = service.department?.branch;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <button
        type="button"
        onClick={() => navigate('/admin/services')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Service List
      </button>

      {/* Main Service Profile Header */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-brand-400" />
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{service.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-950 border border-brand-800 text-brand-400">
                {service.code}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {service.description || 'No custom description defined for this queue service.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge priority={service.priority} />
            <StatusBadge status={service.isActive} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[11px]">Average Duration</span>
              <strong className="text-slate-100 font-mono text-sm">{service.avgServiceTimeMins} Minutes</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <Hash className="w-4 h-4 text-brand-400 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[11px]">Token Prefix</span>
              <strong className="text-brand-400 font-mono text-sm">{service.prefix}-001</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[11px]">Queue Counters Assigned</span>
              <strong className="text-slate-100 font-mono text-sm">{service._count?.counterServices ?? 0} Counters</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Branch Details & Queue Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Branch Details */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl backdrop-blur-md space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <GitBranch className="w-4 h-4 text-brand-400" /> Branch Location Info
          </h3>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-slate-500 block">Branch Name</span>
              <span className="font-bold text-slate-200 text-sm">{branch?.name || 'Central General Hospital'}</span>
            </div>

            <div>
              <span className="text-slate-500 block">Branch Code</span>
              <span className="font-mono text-brand-400 font-bold">{branch?.code || 'CENTRAL'}</span>
            </div>

            <div>
              <span className="text-slate-500 block">Department</span>
              <span className="text-slate-300">{service.department?.name || 'General Services'}</span>
            </div>
          </div>
        </div>

        {/* Queue Configuration Preview */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl backdrop-blur-md space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Ticket className="w-4 h-4 text-emerald-400" /> Live Ticket Token Preview
          </h3>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Sample Ticket Format</span>
              <div className="text-3xl font-black font-mono text-brand-400">{service.prefix}-104</div>
            </div>

            <div className="text-right space-y-1">
              <PriorityBadge priority={service.priority} />
              <span className="block text-[11px] text-slate-400 font-mono">Est: ~{service.avgServiceTimeMins}m wait</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
