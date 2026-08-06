import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useCounters } from '@/features/counter/hooks/useCounterQueries';
import {
  useCounterQueue,
  useNextToken,
  useStartToken,
  useCompleteToken,
  useSkipToken,
} from '@/features/staff-queue/hooks/useStaffQueueQueries';
import { CounterHeader } from '@/features/staff-queue/components/CounterHeader';
import { CurrentTokenCard } from '@/features/staff-queue/components/CurrentTokenCard';
import { WaitingQueueList } from '@/features/staff-queue/components/WaitingQueueList';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { BellRing, Monitor, AlertCircle, Wifi } from 'lucide-react';

export const StaffDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { isConnected, joinRoom } = useSocket();
  const [selectedCounterId, setSelectedCounterId] = useState<string>('');

  // Fetch available counters for operator's branch/org
  const { data: counters = [], isLoading: isCountersLoading } = useCounters(
    user?.organizationId || undefined
  );

  useEffect(() => {
    if (!selectedCounterId && counters.length > 0) {
      setSelectedCounterId(counters[0].id);
    }
  }, [counters, selectedCounterId]);

  // Fetch Counter Queue Dashboard Data
  const { data, isLoading, isError, error, refetch } = useCounterQueue(selectedCounterId);

  // Subscribe to counter & branch real-time socket rooms
  useEffect(() => {
    if (selectedCounterId) {
      joinRoom(`counter:${selectedCounterId}`);
    }
    if (data?.counter?.branchId) {
      joinRoom(`branch:${data.counter.branchId}`);
    }
  }, [selectedCounterId, data?.counter?.branchId, joinRoom]);

  // Operator Action Mutations
  const callNextMutation = useNextToken(selectedCounterId);
  const startMutation = useStartToken(selectedCounterId);
  const completeMutation = useCompleteToken(selectedCounterId);
  const skipMutation = useSkipToken(selectedCounterId);

  // Confirmation dialog states
  const [confirmAction, setConfirmAction] = useState<'SKIP' | null>(null);

  const handleCallNext = () => {
    if (!selectedCounterId) return;
    callNextMutation.mutate({ counterId: selectedCounterId });
  };

  const handleStart = () => {
    if (!data?.currentServingToken) return;
    startMutation.mutate(data.currentServingToken.id);
  };

  const handleComplete = () => {
    if (!data?.currentServingToken) return;
    completeMutation.mutate(data.currentServingToken.id);
  };

  const handleSkipConfirm = () => {
    if (!data?.currentServingToken) return;
    skipMutation.mutate(data.currentServingToken.id, {
      onSuccess: () => setConfirmAction(null),
    });
  };

  if (isCountersLoading || (isLoading && !data)) {
    return <LoadingState message="Loading staff counter dashboard..." rows={4} />;
  }

  if (isError && !data) {
    return (
      <ErrorState
        title="Failed to load Counter Dashboard"
        message={error?.message || 'Error communicating with queue engine.'}
        onRetry={refetch}
      />
    );
  }

  const isActionPending =
    callNextMutation.isPending ||
    startMutation.isPending ||
    completeMutation.isPending ||
    skipMutation.isPending;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Counter Selection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-brand-400" />
          <span className="text-xs font-bold text-slate-200">Active Counter Desk:</span>
          <select
            value={selectedCounterId}
            onChange={(e) => setSelectedCounterId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-brand-400 px-3 py-1.5 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            {counters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (Counter #{c.number})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && (
            <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800">
              <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" /> Live Socket Sync
            </span>
          )}

          {/* CALL NEXT TOKEN BUTTON */}
          <button
            type="button"
            onClick={handleCallNext}
            disabled={isActionPending}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-brand-600/30 flex items-center gap-2 disabled:opacity-60"
          >
            <BellRing className="w-4 h-4 fill-white" /> CALL NEXT TOKEN
          </button>
        </div>
      </div>

      {callNextMutation.isError && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{callNextMutation.error.message}</span>
        </div>
      )}

      {/* Counter Header Card */}
      {data && (
        <CounterHeader
          counter={data.counter}
          operatorName={user?.fullName}
        />
      )}

      {/* Grid: Current Serving Token & Waiting Queue List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Serving Token Card */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Current Counter Ticket
          </h2>
          <CurrentTokenCard
            token={data?.currentServingToken || null}
            onStart={handleStart}
            onComplete={handleComplete}
            onSkip={() => setConfirmAction('SKIP')}
            isPending={isActionPending}
          />
        </div>

        {/* Waiting Queue Line */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Waiting Queue Preview
          </h2>
          <WaitingQueueList
            tokens={data?.nextWaitingTokens || []}
            totalWaitingCount={data?.waitingTokensCount || 0}
          />
        </div>
      </div>

      {/* Skip Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmAction === 'SKIP'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleSkipConfirm}
        title="Skip Customer Ticket?"
        description={`Mark ticket ${data?.currentServingToken?.tokenNumber} as no-show / skipped?`}
        confirmText="Skip Ticket"
        isLoading={skipMutation.isPending}
      />
    </div>
  );
};
