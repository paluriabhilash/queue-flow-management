import React, { useState, useEffect } from 'react';
import { useBranches } from '@/features/branch/hooks/useBranchQueries';
import { Branch } from '@/features/branch/types';
import { useAnalyticsDashboard } from '@/features/analytics/hooks/useAnalyticsQueries';
import { AnalyticsSummaryCards } from '@/features/analytics/components/AnalyticsSummaryCards';
import { QueueTrafficChart } from '@/features/analytics/components/QueueTrafficChart';
import { ServicePerformanceChart } from '@/features/analytics/components/ServicePerformanceChart';
import { CounterPerformanceTable } from '@/features/analytics/components/CounterPerformanceTable';
import { PriorityDistributionChart } from '@/features/analytics/components/PriorityDistributionChart';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { BarChart2, GitBranch, RefreshCw } from 'lucide-react';

export const AnalyticsDashboardPage: React.FC = () => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  // Fetch available branches
  const { data: branches = [], isLoading: isBranchesLoading } = useBranches();

  useEffect(() => {
    if (!selectedBranchId && branches.length > 0) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

  // Fetch Analytics Dashboard Data for Selected Branch
  const { data, isLoading, isError, error, refetch, isRefetching } = useAnalyticsDashboard(selectedBranchId);

  if (isBranchesLoading || (isLoading && !data)) {
    return <LoadingState message="Loading analytics dashboard..." rows={4} />;
  }

  if (isError && !data) {
    return (
      <ErrorState
        title="Failed to load Analytics"
        message={error?.message || 'Error communicating with analytics server.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Branch Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-brand-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Queue Analytics Dashboard</h1>
          </div>
          <p className="text-xs text-slate-400">
            Real-time queue performance metrics, traffic trends, and service efficiency statistics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isRefetching && (
            <span className="text-[11px] text-brand-400 font-mono flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Refreshing...
            </span>
          )}

          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-slate-400" />
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-brand-400 px-3 py-2 focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              {branches.map((b: Branch) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {data?.summary && <AnalyticsSummaryCards summary={data.summary} />}

      {/* Traffic & Priority Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <QueueTrafficChart data={data?.hourlyStats || []} />
        </div>
        <div className="lg:col-span-4">
          <PriorityDistributionChart data={data?.priorityDistribution || []} />
        </div>
      </div>

      {/* Service Performance & Counter Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ServicePerformanceChart data={data?.servicePerformance || []} />
        </div>
        <div className="lg:col-span-5">
          <CounterPerformanceTable data={data?.counterPerformance || []} />
        </div>
      </div>
    </div>
  );
};
