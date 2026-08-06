import React from 'react';

export interface LoadingStateProps {
  message?: string;
  rows?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  rows = 3,
}) => {
  return (
    <div className="w-full space-y-4 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-slate-800 rounded-lg w-1/3" />
        <div className="h-6 bg-slate-800 rounded-lg w-16" />
      </div>

      <div className="space-y-3 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-800/60 rounded-xl w-full" />
        ))}
      </div>

      <div className="flex items-center justify-center pt-2 text-xs text-slate-500 font-medium">
        <span>{message}</span>
      </div>
    </div>
  );
};
