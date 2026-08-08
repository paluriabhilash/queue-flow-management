import React from 'react';
import { useLiveWaitCountdown } from '../hooks/useLiveWaitCountdown';
import { TokenStatus } from '../types';
import { Clock, Sparkles, AlertCircle, CheckCircle, Activity, UserCheck } from 'lucide-react';

export interface EstimatedWaitCardProps {
  estimatedWaitMins?: number;
  createdAt?: string | Date;
  calledAt?: string | Date | null;
  servedAt?: string | Date | null;
  completedAt?: string | Date | null;
  status?: TokenStatus | string;
  avgServiceTimeMins?: number;
  computedStatus?: TokenStatus;
  formattedElapsed?: string;
  formattedCountdown?: string;
}

export const EstimatedWaitCard: React.FC<EstimatedWaitCardProps> = ({
  estimatedWaitMins = 10,
  createdAt,
  calledAt,
  servedAt,
  completedAt,
  status = 'WAITING',
  avgServiceTimeMins = 1,
  computedStatus: computedStatusProp,
  formattedElapsed: formattedElapsedProp,
  formattedCountdown: formattedCountdownProp,
}) => {
  const tokenStatus = (status as TokenStatus) || 'WAITING';

  const liveData = useLiveWaitCountdown({
    estimatedWaitMins,
    createdAt,
    calledAt,
    servedAt,
    completedAt,
    status: tokenStatus,
    avgServiceTimeMins,
  });

  const activeComputedStatus = computedStatusProp || liveData.computedStatus;
  const activeFormattedElapsed = formattedElapsedProp || liveData.formattedElapsed;
  const activeFormattedCountdown = formattedCountdownProp || liveData.formattedCountdown;
  const progressPercent = liveData.progressPercent;

  const isServing = activeComputedStatus === 'SERVING';
  const isCalled = activeComputedStatus === 'CALLED';
  const isCompleted = activeComputedStatus === 'COMPLETED';
  const isCancelled = activeComputedStatus === 'CANCELLED' || activeComputedStatus === 'SKIPPED';

  // Calculate estimated completion clock time
  const getEstimatedClockTime = () => {
    if (!estimatedWaitMins) return '';
    const now = Date.now();
    const estTime = new Date(now + estimatedWaitMins * 60 * 1000);
    return estTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl backdrop-blur-md space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-400" /> Estimated Wait Time
        </span>

        {activeComputedStatus === 'WAITING' ? (
          <span className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/80">
            <Activity className="w-3 h-3 text-amber-400 animate-pulse" /> Live Decrementing
          </span>
        ) : (
          <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/80 animate-pulse">
            <Sparkles className="w-3 h-3 text-emerald-400" /> On Process
          </span>
        )}
      </div>

      {/* Main Countdown or Status Content */}
      <div>
        {isCompleted ? (
          <div className="space-y-1">
            <div className="text-2xl font-black text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-400" /> Completed
            </div>
            <p className="text-xs text-slate-400">Total duration: {activeFormattedElapsed}</p>
          </div>
        ) : isServing ? (
          <div className="space-y-2">
            <div className="text-2xl font-black text-emerald-400 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-400 animate-spin" /> On Process / In Service
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              Active Service Time: <strong className="font-mono text-white text-sm">{activeFormattedElapsed}</strong>
            </p>
          </div>
        ) : isCalled ? (
          <div className="space-y-1">
            <div className="text-2xl font-black text-emerald-300 tracking-tight flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-300 animate-bounce" /> Called to Counter #1
            </div>
            <p className="text-xs text-slate-300">Please walk to your assigned counter desk immediately.</p>
          </div>
        ) : isCancelled ? (
          <div className="space-y-1">
            <div className="text-xl font-bold text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Inactive Ticket
            </div>
            <p className="text-xs text-slate-400">This ticket is no longer active in the queue.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-black font-mono text-amber-300 tracking-tight flex items-center gap-2">
                  {activeFormattedCountdown}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Est. Call Time: <strong className="text-slate-200 font-mono">~{getEstimatedClockTime()}</strong>
                </p>
              </div>

              <div className="text-right font-mono text-xs text-slate-400">
                <span>Total: ~{estimatedWaitMins}m</span>
              </div>
            </div>

            {/* Live Progress Bar */}
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Issued</span>
                <span>{progressPercent}% elapsed</span>
                <span>Counter Desk</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
