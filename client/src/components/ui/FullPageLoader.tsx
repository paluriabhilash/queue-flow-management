import React from 'react';

export interface FullPageLoaderProps {
  message?: string;
}

export const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  message = 'Restoring session...',
}) => {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden text-slate-100">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        {/* Animated Brand Spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-xl bg-brand-600/20 border border-brand-500/40 animate-ping" />
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-brand-600/50">
            Q
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-brand-400 bg-clip-text text-transparent">
            QueueFlow
          </h3>
          <p className="text-xs text-slate-400 font-medium animate-pulse">{message}</p>
        </div>
      </div>
    </div>
  );
};
