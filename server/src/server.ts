import http from 'http';
import app from './app';
import dotenv from 'dotenv';
import { initSocketServer } from './socket/socket.server';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO Real-time Engine
initSocketServer(server);

server.listen(PORT, () => {
  console.log(`🚀 QueueFlow Server running on port ${PORT}`);
  console.log(`📡 Healthcheck: http://localhost:${PORT}/health`);
  console.log(`🔌 Socket.IO Real-time Engine enabled`);
});
