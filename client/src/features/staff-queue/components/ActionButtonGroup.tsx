import React from 'react';
import { TokenStatus } from '@/features/queue/types';
import { Play, CheckCircle2, FastForward } from 'lucide-react';

export interface ActionButtonGroupProps {
  status: TokenStatus;
  onStart: () => void;
  onComplete: () => void;
  onSkip: () => void;
  isPending?: boolean;
}

export const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  status,
  onStart,
  onComplete,
  onSkip,
  isPending = false,
}) => {
  const isCalled = status === 'CALLED';
  const isServing = status === 'SERVING';

  return (
    <div className="flex flex-wrap items-center gap-3">
      {isCalled && (
        <button
          type="button"
          onClick={onStart}
          disabled={isPending}
          className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 disabled:opacity-60"
        >
          <Play className="w-4 h-4 fill-white" /> START SERVICE
        </button>
      )}

      {isServing && (
        <button
          type="button"
          onClick={onComplete}
          disabled={isPending}
          className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-60"
        >
          <CheckCircle2 className="w-4 h-4" /> COMPLETE SERVICE
        </button>
      )}

      {isCalled && (
        <button
          type="button"
          onClick={onSkip}
          disabled={isPending}
          className="py-3 px-4 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          <FastForward className="w-4 h-4" /> SKIP NO-SHOW
        </button>
      )}
    </div>
  );
};
