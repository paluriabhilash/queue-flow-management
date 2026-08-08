import React from 'react';
import { TicketTokenItem, TokenStatus } from '../types';
import { useLiveWaitCountdown } from '../hooks/useLiveWaitCountdown';
import {
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  AlertTriangle,
  XCircle,
  Layers,
  Sparkles,
  Timer,
  UserCheck,
  Play,
  Trash2,
  ChevronRight,
} from 'lucide-react';

export interface StatusTimelineProps {
  token?: TicketTokenItem | null;
  status?: TokenStatus;
  estimatedWaitMins?: number;
  onAdvanceStep?: () => void;
  onDeleteTicket?: () => void;
  isActionPending?: boolean;
  computedStatus?: TokenStatus;
  computedStepNumber?: number;
  formattedElapsed?: string;
  isTimelineComplete?: boolean;
}

const formatTimestamp = (dateStr?: string | Date | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (e) {
    return '';
  }
};

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  token,
  status: statusProp,
  estimatedWaitMins: estimatedWaitMinsProp,
  onAdvanceStep,
  onDeleteTicket,
  isActionPending = false,
  computedStatus: computedStatusProp,
  computedStepNumber: computedStepNumberProp,
  formattedElapsed: formattedElapsedProp,
  isTimelineComplete: isTimelineCompleteProp,
}) => {
  const dbStatus = token?.status || statusProp || 'WAITING';
  const waitMins = token?.estimatedWaitTime ?? estimatedWaitMinsProp ?? 10;
  const avgServiceMins = token?.service?.avgServiceTimeMins || 1;

  const liveCountdown = useLiveWaitCountdown({
    estimatedWaitMins: waitMins,
    createdAt: token?.createdAt,
    calledAt: token?.calledAt,
    servedAt: token?.servedAt,
    completedAt: token?.completedAt,
    status: dbStatus,
    avgServiceTimeMins: avgServiceMins,
  });

  const computedStatus = computedStatusProp || liveCountdown.computedStatus;
  const computedStepNumber = computedStepNumberProp || liveCountdown.computedStepNumber;
  const formattedElapsed = formattedElapsedProp || liveCountdown.formattedElapsed;
  const isTimelineComplete = isTimelineCompleteProp ?? liveCountdown.isTimelineComplete;

  const steps: {
    key: 'WAITING' | 'CALLED' | 'SERVING' | 'COMPLETED';
    label: string;
    desc: string;
    getTimestamp: () => string;
    getDetail: () => string;
  }[] = [
    {
      key: 'WAITING',
      label: 'Ticket Issued',
      desc: 'In queue line',
      getTimestamp: () => (token?.createdAt ? formatTimestamp(token.createdAt) : ''),
      getDetail: () =>
        token?.queuePosition
          ? `Position #${token.queuePosition}`
          : 'Ticket placed in line',
    },
    {
      key: 'CALLED',
      label: 'Called at Counter',
      desc: 'Proceed to desk',
      getTimestamp: () =>
        token?.calledAt
          ? formatTimestamp(token.calledAt)
          : computedStatus === 'CALLED'
          ? 'Just Called!'
          : '',
      getDetail: () =>
        token?.counter
          ? `Counter #${token.counter.number}`
          : computedStatus === 'WAITING'
          ? 'Awaiting call'
          : 'Counter Desk #1',
    },
    {
      key: 'SERVING',
      label: 'In Service',
      desc: 'On Process',
      getTimestamp: () =>
        token?.servedAt
          ? formatTimestamp(token.servedAt)
          : computedStatus === 'SERVING'
          ? 'Service active'
          : '',
      getDetail: () =>
        token?.service?.name ? token.service.name : 'Active service session',
    },
    {
      key: 'COMPLETED',
      label: 'Completed',
      desc: 'Finished',
      getTimestamp: () =>
        token?.completedAt
          ? formatTimestamp(token.completedAt)
          : isTimelineComplete
          ? 'Done'
          : '',
      getDetail: () => (isTimelineComplete ? 'All steps complete!' : 'Final step'),
    },
  ];

  const getStepState = (stepKey: string) => {
    if (dbStatus === 'CANCELLED' || dbStatus === 'SKIPPED') {
      if (dbStatus === 'SKIPPED' && stepKey === 'CALLED') return 'skipped';
      return 'past';
    }

    const orderMap: Record<string, number> = {
      WAITING: 1,
      CALLED: 2,
      SERVING: 3,
      COMPLETED: 4,
    };

    const currentOrder = computedStepNumber;
    const stepOrder = orderMap[stepKey] || 1;

    if (stepOrder < currentOrder) return 'completed';
    if (stepOrder === currentOrder) return 'current';
    return 'upcoming';
  };

  const getProgressPercentage = () => {
    switch (computedStatus) {
      case 'WAITING':
        return 15;
      case 'CALLED':
        return 50;
      case 'SERVING':
        return 75;
      case 'COMPLETED':
        return 100;
      default:
        return 0;
    }
  };

  const isAbnormalStatus = dbStatus === 'CANCELLED' || dbStatus === 'SKIPPED';
  const isFinished = computedStatus === 'COMPLETED' || isAbnormalStatus;

  const getNextStepButtonInfo = () => {
    switch (computedStatus) {
      case 'WAITING':
        return {
          text: '📢 Advance Step: Call at Counter',
          icon: <UserCheck className="w-4 h-4" />,
          color: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30',
        };
      case 'CALLED':
        return {
          text: '▶️ Advance Step: Start Service',
          icon: <Play className="w-4 h-4" />,
          color: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30',
        };
      case 'SERVING':
        return {
          text: '✓ Advance Step: Complete Ticket',
          icon: <CheckCircle2 className="w-4 h-4" />,
          color: 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/30',
        };
      default:
        return null;
    }
  };

  const actionInfo = getNextStepButtonInfo();

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl backdrop-blur-md space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-400" /> Live Status Timeline
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time step progression & active timestamps
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 shadow-sm ${
              computedStatus === 'COMPLETED'
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                : computedStatus === 'CALLED'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500 animate-pulse'
                : computedStatus === 'SERVING'
                ? 'bg-indigo-950/90 text-indigo-300 border-indigo-500 animate-pulse'
                : 'bg-brand-950/80 text-brand-300 border-brand-800/80'
            }`}
          >
            {computedStatus === 'COMPLETED' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Timer className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            )}
            {computedStatus === 'COMPLETED'
              ? 'Total Duration:'
              : computedStatus === 'SERVING'
              ? 'On Process / In Service:'
              : computedStatus === 'CALLED'
              ? 'CALLED TO COUNTER'
              : 'Step duration:'}{' '}
            <span className="text-white ml-1">{formattedElapsed}</span>
          </span>
        </div>
      </div>

      {/* Abnormal Status Warning Callout */}
      {isAbnormalStatus && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            dbStatus === 'CANCELLED'
              ? 'bg-rose-950/50 border-rose-800 text-rose-300'
              : 'bg-amber-950/50 border-amber-800 text-amber-300'
          }`}
        >
          {dbStatus === 'CANCELLED' ? (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wide">
              Ticket {dbStatus}
            </h5>
            <p className="text-xs text-slate-300 mt-0.5">
              {dbStatus === 'CANCELLED'
                ? `This token ticket was cancelled at ${
                    token?.cancelledAt ? formatTimestamp(token.cancelledAt) : 'the desk'
                  }.`
                : 'This token ticket was skipped due to customer no-show.'}
            </p>
          </div>
        </div>
      )}

      {/* Connector Progress Bar Line (desktop) */}
      <div className="relative">
        <div className="hidden sm:block absolute top-6 left-[10%] right-[10%] h-1 bg-slate-800 rounded-full z-0">
          <div
            className="h-full bg-gradient-to-r from-brand-500 via-emerald-400 to-emerald-500 transition-all duration-700 rounded-full"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        {/* Timeline Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
          {steps.map((s) => {
            const state = getStepState(s.key);
            const timestamp = s.getTimestamp();
            const detailText = s.getDetail();

            return (
              <div
                key={s.key}
                className={`p-4 rounded-xl border space-y-2 transition-all relative group cursor-pointer hover:border-brand-400/60 ${
                  state === 'completed'
                    ? 'bg-brand-950/40 border-brand-800/80 text-brand-200 hover:bg-brand-950/60'
                    : state === 'current'
                    ? 'bg-brand-900/60 border-brand-400 text-white shadow-lg shadow-brand-500/20 ring-2 ring-brand-500/40 hover:bg-brand-900/80'
                    : state === 'skipped'
                    ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {state === 'completed' ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400 shadow-md">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : state === 'current' ? (
                      <div className="w-7 h-7 rounded-full bg-brand-600 border border-brand-400 flex items-center justify-center text-white shadow-lg animate-pulse">
                        {s.key === 'WAITING' ? (
                          <Clock className="w-4 h-4" />
                        ) : s.key === 'CALLED' ? (
                          <UserCheck className="w-4 h-4" />
                        ) : s.key === 'SERVING' ? (
                          <Sparkles className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                        <Circle className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <strong className="text-xs font-bold block">{s.label}</strong>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-700 hidden sm:block shrink-0" />
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-800/50">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{s.desc}</span>
                    {timestamp && (
                      <span className="font-mono font-semibold text-brand-300 text-[10px]">
                        {timestamp}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    {detailText}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {actionInfo && onAdvanceStep && (
          <button
            type="button"
            disabled={isActionPending}
            onClick={onAdvanceStep}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] ${actionInfo.color}`}
          >
            {actionInfo.icon}
            <span>{actionInfo.text}</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        )}

        {isFinished && onDeleteTicket && (
          <button
            type="button"
            disabled={isActionPending}
            onClick={onDeleteTicket}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 text-xs font-semibold transition-all shadow-md"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Delete Ticket Token</span>
          </button>
        )}
      </div>
    </div>
  );
};
