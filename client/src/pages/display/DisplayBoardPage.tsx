import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import { useBranchDisplayBoard } from '@/features/display-board/hooks/useDisplayBoardQueries';
import { ServiceIndicator } from '@/features/display-board/components/ServiceIndicator';
import { CurrentServingCard } from '@/features/display-board/components/CurrentServingCard';
import { NextTokensList } from '@/features/display-board/components/NextTokensList';
import { TokenAnnouncement, speakTokenCall } from '@/features/display-board/components/TokenAnnouncement';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { TicketTokenItem } from '@/features/queue/types';
import { SOCKET_EVENTS } from '@/socket/socket.events';
import { Tv, BellRing } from 'lucide-react';

export const DisplayBoardPage: React.FC = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const { socket, isConnected, joinRoom } = useSocket();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeAnnouncement, setActiveAnnouncement] = useState<{
    tokenNumber: string;
    counterNumber: string | number;
    serviceName?: string;
  } | null>(null);

  // Fetch Branch Display Board Data
  const { data, isLoading, isError, error, refetch } = useBranchDisplayBoard(branchId);

  // Live Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Subscribe to Branch Socket Room & Listen for Queue Events
  useEffect(() => {
    if (branchId) {
      joinRoom(`branch:${branchId}`);
    }

    if (!socket) return;

    const handleTokenCalled = (tokenItem: TicketTokenItem) => {
      console.log('📺 [Display Board] Token Called Socket Event:', tokenItem);
      refetch();

      // Trigger Text-To-Speech & Announcement Overlay
      const tokenNum = tokenItem.tokenNumber;
      const counterNum = tokenItem.counter?.number || 1;
      const serviceName = tokenItem.service?.name;

      setActiveAnnouncement({
        tokenNumber: tokenNum,
        counterNumber: counterNum,
        serviceName,
      });

      speakTokenCall(tokenNum, counterNum);
    };

    const handleQueueUpdate = () => {
      console.log('📺 [Display Board] Queue Update Socket Event');
      refetch();
    };

    socket.on(SOCKET_EVENTS.QUEUE_TOKEN_CALLED, handleTokenCalled);
    socket.on(SOCKET_EVENTS.QUEUE_TOKEN_STARTED, handleQueueUpdate);
    socket.on(SOCKET_EVENTS.QUEUE_TOKEN_COMPLETED, handleQueueUpdate);
    socket.on(SOCKET_EVENTS.QUEUE_TOKEN_SKIPPED, handleQueueUpdate);
    socket.on(SOCKET_EVENTS.QUEUE_UPDATE, handleQueueUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.QUEUE_TOKEN_CALLED, handleTokenCalled);
      socket.off(SOCKET_EVENTS.QUEUE_TOKEN_STARTED, handleQueueUpdate);
      socket.off(SOCKET_EVENTS.QUEUE_TOKEN_COMPLETED, handleQueueUpdate);
      socket.off(SOCKET_EVENTS.QUEUE_TOKEN_SKIPPED, handleQueueUpdate);
      socket.off(SOCKET_EVENTS.QUEUE_UPDATE, handleQueueUpdate);
    };
  }, [branchId, socket, joinRoom, refetch]);

  if (isLoading) {
    return <LoadingState message="Initializing public display board TV interface..." rows={4} />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Failed to load Display Board"
        message={error?.message || 'Branch location display data unavailable.'}
        onRetry={refetch}
      />
    );
  }

  const { branch, currentlyServing = [], nextWaiting = [] } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Active Announcement Flash Overlay */}
      {activeAnnouncement && (
        <TokenAnnouncement
          tokenNumber={activeAnnouncement.tokenNumber}
          counterNumber={activeAnnouncement.counterNumber}
          serviceName={activeAnnouncement.serviceName}
          onDismiss={() => setActiveAnnouncement(null)}
        />
      )}

      {/* Header Indicator */}
      <ServiceIndicator
        branchName={branch.name}
        isConnected={isConnected}
        currentTime={currentTime}
      />

      {/* Main Grid: Currently Serving vs Next Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        {/* Left Column: Currently Called / Serving Tokens (8 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black uppercase tracking-wider text-white flex items-center gap-2">
              <BellRing className="w-5 h-5 text-amber-400 animate-pulse" /> Now Serving / Called Tokens
            </h2>
            <span className="text-xs font-mono font-bold text-slate-400">
              Active: {currentlyServing.length} Counter Desks
            </span>
          </div>

          {currentlyServing.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
                <Tv className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-300">All Counters Ready</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active tickets are currently being called or served.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentlyServing.map((token) => (
                <CurrentServingCard
                  key={token.id}
                  token={token}
                  isHighlighted={activeAnnouncement?.tokenNumber === token.tokenNumber}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Next Waiting Tokens (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xl font-black uppercase tracking-wider text-slate-300 px-2">
            Upcoming Queue
          </h2>
          <NextTokensList tokens={nextWaiting} />
        </div>
      </div>

      {/* TV Display Footer Marquee */}
      <footer className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-center text-xs text-slate-400 font-medium flex items-center justify-between">
        <span className="font-mono text-[11px] text-brand-400 font-bold">
          QueueFlow TV Engine • Branch #{branch.code}
        </span>
        <span className="text-slate-400">
          Please keep your ticket token ready. Watch the display board for your token number.
        </span>
      </footer>
    </div>
  );
};
