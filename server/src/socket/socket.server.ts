import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { env } from '../config/env';
import { SOCKET_EVENTS, SocketEventType, RoomMeta, formatRoomNames } from './socket.events';

export interface AuthenticatedSocket extends Socket {
  user?: JwtPayload;
}

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // JWT Authentication Middleware for Socket Connection
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const authHeader = socket.handshake.headers.authorization;
      const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.query?.token as string) ||
        tokenFromHeader;

      if (!token) {
        // Allow unauthenticated connection for public kiosk / display, but mark user as null
        return next();
      }

      const decoded = verifyToken(token);
      socket.user = decoded;
      next();
    } catch (err) {
      console.warn('⚠️ Socket JWT authentication failed:', err instanceof Error ? err.message : err);
      // Proceed without user object rather than blocking display boards
      next();
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.user?.email || 'Anonymous'})`);

    // Handle joining specific rooms (e.g. branch, service, counter)
    socket.on('join-room', (room: string) => {
      socket.join(room);
      console.log(`📡 Socket ${socket.id} joined room: ${room}`);
    });

    // Handle leaving specific rooms
    socket.on('leave-room', (room: string) => {
      socket.leave(room);
      console.log(`📡 Socket ${socket.id} left room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO server has not been initialized');
  }
  return io;
}

/**
 * Utility function to emit queue events to target rooms and general update channel
 */
export function emitQueueEvent(event: SocketEventType, data: any, meta: RoomMeta = {}): void {
  if (!io) return;

  const targetRooms = formatRoomNames(meta);

  if (targetRooms.length > 0) {
    targetRooms.forEach((room) => {
      io!.to(room).emit(event, data);
      io!.to(room).emit(SOCKET_EVENTS.QUEUE_UPDATE, { event, data });
    });
  } else {
    io.emit(event, data);
    io.emit(SOCKET_EVENTS.QUEUE_UPDATE, { event, data });
  }
}
