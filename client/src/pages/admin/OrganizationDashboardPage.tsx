import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrganizationDetails } from '@/features/organization/hooks/useOrganizationQueries';
import { InfoCard } from '@/components/ui/InfoCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Building2, GitBranch, Layers, Monitor, Ticket, Clock } from 'lucide-react';

export const OrganizationDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.organizationId || '';

  const { data: org, isLoading, isError, error, refetch } = useOrganizationDetails(orgId);

  if (isLoading) {
    return <LoadingState message="Loading organization summary dashboard..." rows={4} />;
  }

  if (isError || !org) {
    return (
      <ErrorState
        title="Failed to load Organization Dashboard"
        message={error?.message || 'Could not fetch organization details.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-brand-950/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{org.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-950 border border-brand-800 text-brand-400">
              {org.code}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {org.description || 'Smart Queue Management & Analytics Dashboard'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="block font-semibold text-slate-300">Status</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active
            </span>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard
          title="Total Branches"
          value={org._count?.branches ?? 1}
          description="Active hospital/office locations"
          icon={<GitBranch className="w-5 h-5 text-brand-400" />}
        />

        <InfoCard
          title="Active Services"
          value={3}
          description="Registration, Consultation, Pharmacy"
          icon={<Layers className="w-5 h-5 text-indigo-400" />}
        />

        <InfoCard
          title="Open Counters"
          value={3}
          description="Serving active queue lines"
          icon={<Monitor className="w-5 h-5 text-amber-400" />}
        />

        <InfoCard
          title="Daily Token Limit"
          value={org.settings?.maxTokensPerDay ?? 500}
          description="Configured maximum token quota"
          icon={<Ticket className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {/* Today's Queue Live Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Metrics */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" /> Today's Real-Time Queue Summary
            </h3>
            <span className="text-xs text-slate-500 font-mono">{new Date().toLocaleDateString()}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Total Issued Tokens</span>
              <div className="text-2xl font-black text-white">42</div>
              <span className="text-[11px] text-emerald-400 font-semibold">+12% vs yesterday</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Completed Services</span>
              <div className="text-2xl font-black text-emerald-400">38</div>
              <span className="text-[11px] text-slate-400">90.4% completion rate</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Avg Waiting Time</span>
              <div className="text-2xl font-black text-amber-400">8.5m</div>
              <span className="text-[11px] text-slate-400">Target: &lt; 15 mins</span>
            </div>
          </div>
        </div>

        {/* Quick Contact & Details Info */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 backdrop-blur-md">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building2 className="w-4 h-4 text-indigo-400" /> Organization Profile
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block">Organization Name</span>
              <span className="font-semibold text-slate-200">{org.name}</span>
            </div>

            <div>
              <span className="text-slate-500 block">System Code</span>
              <span className="font-mono font-bold text-brand-400">{org.code}</span>
            </div>

            <div>
              <span className="text-slate-500 block">Auto Call Service</span>
              <span className="font-semibold text-slate-300">
                {org.settings?.autoCallEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">SMS Alerts</span>
              <span className="font-semibold text-slate-300">
                {org.settings?.smsGatewayEnabled ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
