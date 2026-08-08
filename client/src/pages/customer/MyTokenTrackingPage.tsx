import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import {
  useTokenPosition,
  useCancelToken,
  useMyTokens,
  useStartService,
  useCompleteService,
  useDeleteToken,
} from '@/features/queue/hooks/useQueueQueries';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { QueuePositionCard } from '@/features/queue/components/QueuePositionCard';
import { EstimatedWaitCard } from '@/features/queue/components/EstimatedWaitCard';
import { StatusTimeline } from '@/features/queue/components/StatusTimeline';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useLiveWaitCountdown } from '@/features/queue/hooks/useLiveWaitCountdown';
import {
  ArrowLeft,
  GitBranch,
  Layers,
  Wifi,
  XCircle,
  Ticket,
  CheckCircle2,
  ChevronRight,
  Trash2,
} from 'lucide-react';

export const MyTokenTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isConnected, joinRoom } = useSocket();

  const { data, isLoading, isError, error, refetch } = useTokenPosition(id);
  const { data: myActiveTokens = [] } = useMyTokens();

  const cancelMutation = useCancelToken();
  const startServiceMutation = useStartService();
  const completeServiceMutation = useCompleteService();
  const deleteTokenMutation = useDeleteToken();

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const token = data?.token;
  const queuePosition = data?.queuePosition || 1;
  const queueAheadCount = data?.queueAheadCount || 0;
  const estimatedWaitTime = data?.estimatedWaitTime || 1;

  const {
    computedStatus,
    computedStepNumber,
    formattedElapsed,
    formattedCountdown,
    isTimelineComplete,
  } = useLiveWaitCountdown({
    estimatedWaitMins: estimatedWaitTime,
    createdAt: token?.createdAt,
    calledAt: token?.calledAt,
    servedAt: token?.servedAt,
    completedAt: token?.completedAt,
    status: token?.status || 'WAITING',
    avgServiceTimeMins: token?.service?.avgServiceTimeMins || 1,
  });

  // Subscribe to service/branch room for real-time ticket updates
  useEffect(() => {
    if (data?.token) {
      if (data.token.serviceId) {
        joinRoom(`service:${data.token.serviceId}`);
      }
      if (data.token.queue?.branchId) {
        joinRoom(`branch:${data.token.queue.branchId}`);
      }
    }
  }, [data?.token, joinRoom]);

  const handleCancelConfirm = () => {
    if (!id) return;
    cancelMutation.mutate(id, {
      onSuccess: () => setIsCancelDialogOpen(false),
    });
  };

  const handleDeleteConfirm = () => {
    if (!id) return;
    deleteTokenMutation.mutate(id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        // Find next token or navigate back to dashboard
        const next = myActiveTokens.find((t) => t.id !== id);
        if (next) {
          navigate(`/customer/token/${next.id}`);
        } else {
          navigate('/customer/dashboard');
        }
      },
    });
  };

  const handleAdvanceStep = () => {
    if (!data?.token || !id) return;
    const currentStatus = data.token.status;

    if (currentStatus === 'WAITING' || currentStatus === 'CALLED') {
      startServiceMutation.mutate(id);
    } else if (currentStatus === 'SERVING') {
      completeServiceMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading live queue ticket tracking..." rows={4} />;
  }

  if (isError || !data || !data.token || !token) {
    return (
      <ErrorState
        title="Failed to load Ticket Status"
        message={error?.message || 'Token not found.'}
        onRetry={refetch}
      />
    );
  }

  const isCancellable = token.status === 'WAITING' || token.status === 'CALLED';
  const isFinished =
    token.status === 'COMPLETED' || token.status === 'CANCELLED' || token.status === 'SKIPPED';

  // Find next active ticket
  const nextWaitingToken = myActiveTokens.find(
    (t) => t.id !== id && (t.status === 'WAITING' || t.status === 'CALLED' || t.status === 'SERVING')
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/customer/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-2">
          {isConnected && (
            <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800">
              <Wifi className="w-3 h-3 animate-pulse text-emerald-400" /> Live Socket Sync
            </span>
          )}

          {isCancellable && (
            <button
              type="button"
              onClick={() => setIsCancelDialogOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 border border-rose-800/60 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" /> Cancel Ticket
            </button>
          )}

          {isFinished && (
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4 text-rose-400" /> Delete Ticket
            </button>
          )}
        </div>
      </div>

      {/* Multi-Ticket Switcher Bar */}
      {myActiveTokens.length > 1 && (
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Ticket className="w-3.5 h-3.5 text-brand-400" /> Switch Ticket:
          </span>

          <div className="flex items-center gap-2 overflow-x-auto">
            {myActiveTokens.map((t) => {
              const isSelected = t.id === token.id;
              const isDone = t.status === 'COMPLETED' || t.status === 'CANCELLED' || t.status === 'SKIPPED';
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => navigate(`/customer/token/${t.id}`)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                    isSelected
                      ? 'bg-brand-600 text-white border-brand-400 shadow-md'
                      : isDone
                      ? 'bg-slate-950/40 text-slate-400 border-slate-800/80 hover:border-slate-700'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-brand-500/50'
                  }`}
                >
                  <span>{t.tokenNumber}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isDone
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                        : t.status === 'CALLED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : t.status === 'SERVING'
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {isDone ? 'COMPLETED' : t.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Finished Ticket Alert & Next Ticket Switch Banner */}
      {isFinished && nextWaitingToken && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Current Ticket Finalized
            </span>
            <h3 className="text-base font-bold text-white">
              Next Token Ticket Ready in Queue!
            </h3>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              Next Ticket: <strong className="font-mono text-emerald-300">{nextWaitingToken.tokenNumber}</strong> (
              {nextWaitingToken.service?.name || 'Service'})
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/customer/token/${nextWaitingToken.id}`)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/30 shrink-0"
          >
            Track Next Ticket #{nextWaitingToken.tokenNumber} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Ticket Banner Card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              Live Ticket Status
            </span>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black font-mono text-white tracking-tight">
                {token.tokenNumber}
              </h1>
              <PriorityBadge priority={token.priority} />
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
              <Layers className="w-4 h-4 text-brand-400" /> {token.service?.name || 'General Service'}
            </p>
          </div>

          <div className="text-right space-y-1">
            <span className="text-xs text-slate-400 block font-mono">
              Status: {token.status}
            </span>
            {token.counter && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 inline-block">
                Counter #{token.counter.number} ({token.counter.name})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300">
          <GitBranch className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            Branch Location:{' '}
            <strong className="text-white">
              {token.queue?.branch?.name || 'Central Location'}
            </strong>
          </span>
        </div>
      </div>

      {/* Grid: Position & Estimated Wait Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QueuePositionCard
          position={queuePosition}
          queueAheadCount={queueAheadCount}
          status={token.status}
          computedStatus={computedStatus}
        />
        <EstimatedWaitCard
          estimatedWaitMins={estimatedWaitTime}
          createdAt={token.createdAt}
          calledAt={token.calledAt}
          servedAt={token.servedAt}
          completedAt={token.completedAt}
          status={token.status}
          avgServiceTimeMins={token.service?.avgServiceTimeMins || 1}
          computedStatus={computedStatus}
          formattedElapsed={formattedElapsed}
          formattedCountdown={formattedCountdown}
        />
      </div>

      {/* Live Status Timeline */}
      <StatusTimeline
        token={token}
        computedStatus={computedStatus}
        computedStepNumber={computedStepNumber}
        formattedElapsed={formattedElapsed}
        isTimelineComplete={isTimelineComplete}
        onAdvanceStep={handleAdvanceStep}
        onDeleteTicket={() => setIsDeleteDialogOpen(true)}
        isActionPending={
          startServiceMutation.isPending || completeServiceMutation.isPending || deleteTokenMutation.isPending
        }
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel Ticket Token?"
        description={`Are you sure you want to cancel your queue ticket ${token.tokenNumber}?`}
        confirmText="Cancel Ticket"
        isLoading={cancelMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Ticket Token?"
        description={`Are you sure you want to permanently delete ticket ${token.tokenNumber} from your tracking list?`}
        confirmText="Delete Ticket"
        isLoading={deleteTokenMutation.isPending}
      />
    </div>
  );
};
