import React, { useEffect } from 'react';
import { Volume2, BellRing, Monitor } from 'lucide-react';

export interface TokenAnnouncementProps {
  tokenNumber: string;
  counterNumber: string | number;
  serviceName?: string;
  onDismiss: () => void;
}

export function speakTokenCall(tokenNumber: string, counterNumber: string | number) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const announcement = `Token ${tokenNumber}, please proceed to Counter ${counterNumber}`;
    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis warning:', err);
  }
}

export const TokenAnnouncement: React.FC<TokenAnnouncementProps> = ({
  tokenNumber,
  counterNumber,
  serviceName,
  onDismiss,
}) => {
  useEffect(() => {
    // Speak Text-To-Speech on mount
    speakTokenCall(tokenNumber, counterNumber);

    // Auto dismiss overlay after 6 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);

    return () => clearTimeout(timer);
  }, [tokenNumber, counterNumber, onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="p-10 rounded-3xl bg-slate-900 border-2 border-brand-500 shadow-2xl ring-4 ring-brand-500/20 max-w-2xl w-full text-center space-y-6 animate-scaleUp">
        <div className="flex items-center justify-center gap-2 text-brand-400 font-mono font-bold text-xs uppercase tracking-widest">
          <BellRing className="w-5 h-5 animate-bounce" /> Now Calling Customer Ticket
        </div>

        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-medium block">TICKET NUMBER</span>
          <div className="text-7xl lg:text-8xl font-black font-mono text-white tracking-tighter drop-shadow-lg">
            {tokenNumber}
          </div>
          {serviceName && <span className="text-sm font-semibold text-slate-300 block">{serviceName}</span>}
        </div>

        <div className="p-6 rounded-2xl bg-brand-950/80 border border-brand-500/40 text-brand-300 flex items-center justify-center gap-3">
          <Monitor className="w-8 h-8 text-brand-400" />
          <span className="text-3xl lg:text-4xl font-black font-mono tracking-tight">
            PROCEED TO COUNTER #{counterNumber}
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
          <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" /> Audio Announcement In Progress
        </div>
      </div>
    </div>
  );
};
