import { useState, useEffect } from 'react';
import { TokenStatus } from '../types';

export interface UseLiveWaitCountdownProps {
  estimatedWaitMins?: number;
  createdAt?: string | Date;
  calledAt?: string | Date | null;
  servedAt?: string | Date | null;
  completedAt?: string | Date | null;
  status?: TokenStatus;
  avgServiceTimeMins?: number;
}

export interface UseLiveWaitCountdownReturn {
  remainingSeconds: number;
  remainingMinutes: number;
  formattedCountdown: string;
  elapsedSeconds: number;
  formattedElapsed: string;
  progressPercent: number;
  isExpired: boolean;
  computedStatus: TokenStatus;
  computedStepNumber: number; // 1: WAITING, 2: CALLED, 3: SERVING, 4: COMPLETED
  isTimelineComplete: boolean;
}

export const useLiveWaitCountdown = ({
  estimatedWaitMins = 1,
  createdAt,
  calledAt,
  servedAt,
  completedAt,
  status = 'WAITING',
  avgServiceTimeMins = 1,
}: UseLiveWaitCountdownProps): UseLiveWaitCountdownReturn => {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Starting anchor timestamp
  const startTime = createdAt ? new Date(createdAt).getTime() : Date.now();
  const totalTargetWaitDurationMs = Math.max(0.5, estimatedWaitMins) * 60 * 1000;
  const targetEndTimeMs = startTime + totalTargetWaitDurationMs;

  const callWindowMs = 12 * 1000; // 12 seconds for Called at Counter
  const serviceWindowMs = Math.max(25 * 1000, avgServiceTimeMins * 60 * 1000);
  const autoCompletionTimeMs = targetEndTimeMs + callWindowMs + serviceWindowMs;

  // Remaining wait time calculation for WAITING state
  const totalDiffMs = targetEndTimeMs - now;
  const remainingTotalSeconds = Math.max(0, Math.floor(totalDiffMs / 1000));
  const remainingMinutes = Math.floor(remainingTotalSeconds / 60);
  const remainingSecs = remainingTotalSeconds % 60;

  const isExpired = remainingTotalSeconds <= 0;

  // Computed Status calculation:
  let computedStatus: TokenStatus = status;

  if (status === 'CANCELLED' || status === 'SKIPPED') {
    computedStatus = status;
  } else if (status === 'COMPLETED' || status === 'SERVING' || status === 'CALLED') {
    computedStatus = status;
  } else {
    // DB status is WAITING
    if (!isExpired) {
      computedStatus = 'WAITING';
    } else {
      const timePastWaitMs = now - targetEndTimeMs;

      if (timePastWaitMs < callWindowMs) {
        computedStatus = 'CALLED';
      } else if (timePastWaitMs < callWindowMs + serviceWindowMs) {
        computedStatus = 'SERVING';
      } else {
        computedStatus = 'COMPLETED';
      }
    }
  }

  const stepMap: Record<TokenStatus, number> = {
    WAITING: 1,
    CALLED: 2,
    SERVING: 3,
    COMPLETED: 4,
    SKIPPED: 2,
    CANCELLED: 1,
  };

  const computedStepNumber = stepMap[computedStatus] || 1;
  const isTimelineComplete = computedStatus === 'COMPLETED';

  const formattedCountdown =
    computedStatus !== 'WAITING'
      ? '00m 00s'
      : `${String(remainingMinutes).padStart(2, '0')}m ${String(remainingSecs).padStart(2, '0')}s`;

  // Progress percentage (0% when created -> 100% when completed)
  let progressPercent = 0;
  if (computedStatus === 'WAITING') {
    const elapsedFromCreationMs = Math.max(0, now - startTime);
    progressPercent = Math.min(25, Math.round((elapsedFromCreationMs / totalTargetWaitDurationMs) * 25));
  } else if (computedStatus === 'CALLED') {
    progressPercent = 50;
  } else if (computedStatus === 'SERVING') {
    progressPercent = 75;
  } else if (computedStatus === 'COMPLETED') {
    progressPercent = 100;
  }

  // Freeze timestamp calculation once COMPLETED:
  // If actual completedAt exists, use that. Otherwise use autoCompletionTimeMs.
  const completionEndMs = completedAt ? new Date(completedAt).getTime() : autoCompletionTimeMs;
  const effectiveNow = computedStatus === 'COMPLETED' ? Math.min(now, completionEndMs) : now;

  // Calculate live elapsed duration for active state
  let activeStateStartMs = startTime;
  if (computedStatus === 'CALLED' && calledAt) {
    activeStateStartMs = new Date(calledAt).getTime();
  } else if (computedStatus === 'SERVING' && servedAt) {
    activeStateStartMs = new Date(servedAt).getTime();
  } else if (computedStatus === 'COMPLETED') {
    if (completedAt) {
      activeStateStartMs = servedAt ? new Date(servedAt).getTime() : startTime;
    } else {
      activeStateStartMs = targetEndTimeMs + callWindowMs; // service start time
    }
  }

  const elapsedSecondsTotal = Math.max(0, Math.floor((effectiveNow - activeStateStartMs) / 1000));
  const elapsedMins = Math.floor(elapsedSecondsTotal / 60);
  const elapsedSecs = elapsedSecondsTotal % 60;
  const formattedElapsed = `${String(elapsedMins).padStart(2, '0')}m ${String(elapsedSecs).padStart(2, '0')}s`;

  return {
    remainingSeconds: remainingTotalSeconds,
    remainingMinutes,
    formattedCountdown,
    elapsedSeconds: elapsedSecondsTotal,
    formattedElapsed,
    progressPercent,
    isExpired,
    computedStatus,
    computedStepNumber,
    isTimelineComplete,
  };
};
