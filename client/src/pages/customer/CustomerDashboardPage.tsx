import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useMyTokens } from '@/features/queue/hooks/useQueueQueries';
import { TokenCard } from '@/features/queue/components/TokenCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Ticket, Plus, Sparkles, Clock, Wifi, CheckCircle2, History } from 'lucide-react';
import { TicketTokenItem } from '@/features/queue/types';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isConnected, joinRoom } = useSocket();

  const { data: allTokens = [], isLoading, isError, error, refetch } = useMyTokens();

  // Join branch socket rooms for active tokens
  useEffect(() => {
    if (allTokens.length > 0) {
      allTokens.forEach((t) => {
        if (t.queue?.branchId) {
          joinRoom(`branch:${t.queue.branchId}`);
        }
      });
    }
  }, [allTokens, joinRoom]);

  if (isLoading) {
    return <LoadingState message="Loading your queue tickets..." rows={3} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load your tokens"
        message={error?.message || 'Error communicating with server.'}
        onRetry={refetch}
      />
    );
  }

  // Helper to determine if a token is finished/completed
  const isTokenFinished = (t: TicketTokenItem) => {
    if (t.status === 'COMPLETED' || t.status === 'CANCELLED' || t.status === 'SKIPPED') {
      return true;
    }
    if (!t.createdAt || t.status !== 'WAITING') return false;

    const startTime = new Date(t.createdAt).getTime();
    const waitMs = (t.estimatedWaitTime || 1) * 60 * 1000;
    const callWindowMs = 12 * 1000;
    const serviceWindowMs = Math.max(25 * 1000, (t.service?.avgServiceTimeMins || 1) * 60 * 1000);
    const totalCompletionTimeMs = startTime + waitMs + callWindowMs + serviceWindowMs;

    return Date.now() >= totalCompletionTimeMs;
  };

  const activeTokens = allTokens.filter((t) => !isTokenFinished(t));
  const completedTokens = allTokens.filter((t) => isTokenFinished(t));

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-950/80 via-slate-900 to-slate-900 border border-brand-500/20 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.fullName || 'Valued Customer'}!
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Book token tickets, track live queue positions, and view estimated wait times.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" /> Real-time Sync
            </span>
          )}

          <button
            type="button"
            onClick={() => navigate('/customer/get-token')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-lg shadow-brand-600/30 shrink-0"
          >
            <Plus className="w-4 h-4" /> Get New Ticket Token
          </button>
        </div>
      </div>

      {/* SECTION 1: Active Queue Tokens Header & Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-brand-400" /> Your Active Queue Tokens
          </h2>

          <span className="text-xs text-slate-500 font-medium">
            Active: <span className="text-brand-400 font-bold">{activeTokens.length}</span> tickets
          </span>
        </div>

        {activeTokens.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200">No Active Queue Tickets</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You don't have any waiting or in-service queue tokens right now.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/customer/get-token')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Book Ticket Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTokens.map((token) => (
              <TokenCard key={token.id} token={token} />
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Completed & Past Tokens Header & Grid */}
      <div className="space-y-4 pt-6 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Completed & Past Tokens
          </h2>

          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <History className="w-3.5 h-3.5 text-slate-400" /> Past:{' '}
            <span className="text-emerald-400 font-bold">{completedTokens.length}</span> tickets
          </span>
        </div>

        {completedTokens.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <p className="text-xs text-slate-500">
              No completed or past tokens yet. When your active tickets finish service, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedTokens.map((token) => (
              <TokenCard key={token.id} token={token} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
