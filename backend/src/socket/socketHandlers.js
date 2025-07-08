// Socket.IO event handlers for study room features
import { authenticateSocket } from './handlers/authHandler.js';
import { handleJoinRoom, handleLeaveRoom } from './handlers/roomHandler.js';
import { handleSendMessage } from './handlers/chatHandler.js';
import { 
  handleStartTimer,
  handlePauseTimer,
  handleResetTimer,
  handleChangeTimerMode
} from './handlers/timerHandler.js';
import { handleDisconnect } from './handlers/disconnectHandler.js';

export default function setupSocketHandlers(io) {
  // Track active users and their socket IDs
  const activeUsers = new Map();

  // Middleware for socket authentication
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Add user to active users
    if (socket.user) {
      activeUsers.set(socket.user.id.toString(), socket.id);
    }

    // Room events
    socket.on('join-room', (data) => handleJoinRoom(io, socket, data));
    socket.on('leave-room', (data) => handleLeaveRoom(io, socket, data));

    // Chat events
    socket.on('send-message', (data) => handleSendMessage(io, socket, data));

    // Timer events
    socket.on('start-timer', (data) => handleStartTimer(io, socket, data));
    socket.on('pause-timer', (data) => handlePauseTimer(io, socket, data));
    socket.on('reset-timer', (data) => handleResetTimer(io, socket, data));
    socket.on('change-timer-mode', (data) => handleChangeTimerMode(io, socket, data));

    // Handle disconnection
    socket.on('disconnect', () => handleDisconnect(io, socket, activeUsers));
  });
}
