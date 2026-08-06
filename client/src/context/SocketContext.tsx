import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { getSocket, connectSocket, disconnectSocket } from '../socket/socket.client';
import { SOCKET_EVENTS } from '../socket/socket.events';
import { TicketTokenItem } from '@/features/queue/types';

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  calledNotification: { tokenNumber: string; counterNumber: number | string } | null;
  dismissNotification: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [calledNotification, setCalledNotification] = useState<{
    tokenNumber: string;
    counterNumber: number | string;
  } | null>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      const s = connectSocket(token);
      setSocket(s);

      const onConnect = () => {
        setIsConnected(true);
        console.log('⚡ [Socket.IO] Connected to real-time server');
      };

      const onDisconnect = () => {
        setIsConnected(false);
        console.log('⚡ [Socket.IO] Disconnected from server');
      };

      s.on('connect', onConnect);
      s.on('disconnect', onDisconnect);

      // Event Listeners for Query Invalidation & Real-Time Updates
      const onTokenCreated = (data: any) => {
        console.log('⚡ [Socket] Event: queue:token-created', data);
        queryClient.invalidateQueries({ queryKey: ['queue'] });
        queryClient.invalidateQueries({ queryKey: ['counters'] });
        queryClient.invalidateQueries({ queryKey: ['staff-queue'] });
      };

      const onTokenCalled = (tokenItem: TicketTokenItem) => {
        console.log('⚡ [Socket] Event: queue:token-called', tokenItem);
        queryClient.invalidateQueries({ queryKey: ['queue'] });
        queryClient.invalidateQueries({ queryKey: ['counters'] });
        queryClient.invalidateQueries({ queryKey: ['staff-queue'] });

        // Show toast notification if this customer's token was called
        if (user && (tokenItem.customerId === user.id || user.role === 'CUSTOMER')) {
          setCalledNotification({
            tokenNumber: tokenItem.tokenNumber,
            counterNumber: tokenItem.counter?.number || 1,
          });
        }
      };

      const onTokenStarted = (data: any) => {
        console.log('⚡ [Socket] Event: queue:token-started', data);
        queryClient.invalidateQueries({ queryKey: ['queue'] });
        queryClient.invalidateQueries({ queryKey: ['counters'] });
        queryClient.invalidateQueries({ queryKey: ['staff-queue'] });
      };

      const onTokenCompleted = (data: any) => {
        console.log('⚡ [Socket] Event: queue:token-completed', data);
        queryClient.invalidateQueries({ queryKey: ['queue'] });
        queryClient.invalidateQueries({ queryKey: ['counters'] });
        queryClient.invalidateQueries({ queryKey: ['staff-queue'] });
      };

      const onTokenSkipped = (data: any) => {
        console.log('⚡ [Socket] Event: queue:token-skipped', data);
        queryClient.invalidateQueries({ queryKey: ['queue'] });
        queryClient.invalidateQueries({ queryKey: ['counters'] });
        queryClient.invalidateQueries({ queryKey: ['staff-queue'] });
      };

      const onQueueUpdate = (data: any) => {
        console.log('⚡ [Socket] Event: queue:update', data);
        queryClient.invalidateQueries({ queryKey: ['queue'] });
        queryClient.invalidateQueries({ queryKey: ['counters'] });
        queryClient.invalidateQueries({ queryKey: ['staff-queue'] });
      };

      s.on(SOCKET_EVENTS.QUEUE_TOKEN_CREATED, onTokenCreated);
      s.on(SOCKET_EVENTS.QUEUE_TOKEN_CALLED, onTokenCalled);
      s.on(SOCKET_EVENTS.QUEUE_TOKEN_STARTED, onTokenStarted);
      s.on(SOCKET_EVENTS.QUEUE_TOKEN_COMPLETED, onTokenCompleted);
      s.on(SOCKET_EVENTS.QUEUE_TOKEN_SKIPPED, onTokenSkipped);
      s.on(SOCKET_EVENTS.QUEUE_UPDATE, onQueueUpdate);

      return () => {
        s.off('connect', onConnect);
        s.off('disconnect', onDisconnect);
        s.off(SOCKET_EVENTS.QUEUE_TOKEN_CREATED, onTokenCreated);
        s.off(SOCKET_EVENTS.QUEUE_TOKEN_CALLED, onTokenCalled);
        s.off(SOCKET_EVENTS.QUEUE_TOKEN_STARTED, onTokenStarted);
        s.off(SOCKET_EVENTS.QUEUE_TOKEN_COMPLETED, onTokenCompleted);
        s.off(SOCKET_EVENTS.QUEUE_TOKEN_SKIPPED, onTokenSkipped);
        s.off(SOCKET_EVENTS.QUEUE_UPDATE, onQueueUpdate);
        disconnectSocket();
      };
    } else {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
    }
  }, [isAuthenticated, token, user, queryClient]);

  const joinRoom = useCallback((room: string) => {
    const s = getSocket();
    if (s && s.connected) {
      s.emit('join-room', room);
    }
  }, []);

  const leaveRoom = useCallback((room: string) => {
    const s = getSocket();
    if (s && s.connected) {
      s.emit('leave-room', room);
    }
  }, []);

  const dismissNotification = useCallback(() => {
    setCalledNotification(null);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinRoom,
        leaveRoom,
        calledNotification,
        dismissNotification,
      }}
    >
      {children}

      {/* Floating Toast Notification when customer's token is called */}
      {calledNotification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-500 shadow-2xl text-white max-w-sm animate-bounce">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                🔔 YOUR TICKET CALLED!
              </span>
              <p className="text-xs font-semibold text-slate-100 mt-0.5">
                Your token <strong className="text-emerald-300 font-mono text-sm">{calledNotification.tokenNumber}</strong> is called. Please proceed to <strong className="text-white">Counter #{calledNotification.counterNumber}</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={dismissNotification}
              className="p-1 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-300 text-xs font-bold shrink-0"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
