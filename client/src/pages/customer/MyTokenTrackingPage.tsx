import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import { useTokenPosition, useCancelToken } from '@/features/queue/hooks/useQueueQueries';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { QueuePositionCard } from '@/features/queue/components/QueuePositionCard';
import { EstimatedWaitCard } from '@/features/queue/components/EstimatedWaitCard';
import { StatusTimeline } from '@/features/queue/components/StatusTimeline';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ArrowLeft, GitBranch, Layers, Wifi, XCircle } from 'lucide-react';

export const MyTokenTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isConnected, joinRoom } = useSocket();

  const { data, isLoading, isError, error, refetch } = useTokenPosition(id);
  const cancelMutation = useCancelToken();

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

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

  if (isLoading) {
    return <LoadingState message="Loading live queue ticket tracking..." rows={4} />;
  }

  if (isError || !data || !data.token) {
    return (
      <ErrorState
        title="Failed to load Ticket Status"
        message={error?.message || 'Token not found.'}
        onRetry={refetch}
      />
    );
  }

  const { token, queuePosition, queueAheadCount, estimatedWaitTime } = data;
  const isCancellable = token.status === 'WAITING' || token.status === 'CALLED';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/customer/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
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
        </div>
      </div>

      {/* Main Ticket Banner Card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Live Ticket Status</span>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black font-mono text-white tracking-tight">{token.tokenNumber}</h1>
              <PriorityBadge priority={token.priority} />
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
              <Layers className="w-4 h-4 text-brand-400" /> {token.service?.name || 'General Service'}
            </p>
          </div>

          <div className="text-right space-y-1">
            <span className="text-xs text-slate-400 block font-mono">Status: {token.status}</span>
            {token.counter && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 block">
                Counter #{token.counter.number}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300">
          <GitBranch className="w-4 h-4 text-slate-500 shrink-0" />
          <span>Branch Location: <strong className="text-white">{token.queue?.branch?.name || 'Central Location'}</strong></span>
        </div>
      </div>

      {/* Grid: Position & Estimated Wait Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QueuePositionCard
          position={queuePosition}
          queueAheadCount={queueAheadCount}
          status={token.status}
        />
        <EstimatedWaitCard
          estimatedWaitMins={estimatedWaitTime}
          status={token.status}
        />
      </div>

      {/* Live Status Timeline */}
      <StatusTimeline status={token.status} />

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
    </div>
  );
};
