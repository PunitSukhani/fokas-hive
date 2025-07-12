/**
 * Socket.IO Event Handlers Setup
 * 
 * Central configuration for all Socket.IO event handlers in the FokasHive application.
 * Sets up authentication middleware and registers handlers for:
 * 
 * Room Management:
 * - join-room: User joins a room
 * - leave-room: User leaves a room  
 * - get-active-rooms: Fetch list of active rooms
 * 
 * Chat System:
 * - send-message: Send chat message to room
 * 
 * Timer Control:
 * - start-timer: Start room timer (host only)
 * - pause-timer: Pause room timer (host only)
 * - reset-timer: Reset room timer (host only)
 * - change-timer-mode: Change timer mode (host only)
 * - timer-completed: Handle timer completion
 * 
 * Connection Management:
 * - connection: New user connects
 * - disconnect: User disconnects
 * 
 * All events require authentication via JWT token.
 * Active users are tracked for presence features.
 * 
 * @param {Object} io - Socket.IO server instance
 */

// Socket.IO event handlers for FokasHive features
import { authenticateSocket } from './handlers/authHandler.js';
import { handleJoinRoom, handleLeaveRoom, handleGetActiveRooms } from './handlers/roomHandler.js';
import { handleSendMessage } from './handlers/chatHandler.js';
import { 
  handleStartTimer,
  handlePauseTimer,
  handleResetTimer,
  handleChangeTimerMode,
  handleTimerCompleted
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
    socket.on('get-active-rooms', () => handleGetActiveRooms(io, socket));

    // Chat events
    socket.on('send-message', (data) => handleSendMessage(io, socket, data));

    // Timer events
    socket.on('start-timer', (data) => handleStartTimer(io, socket, data));
    socket.on('pause-timer', (data) => handlePauseTimer(io, socket, data));
    socket.on('reset-timer', (data) => handleResetTimer(io, socket, data));
    socket.on('change-timer-mode', (data) => handleChangeTimerMode(io, socket, data));
    socket.on('timer-completed', (data) => handleTimerCompleted(io, socket, data));

    // Handle disconnection
    socket.on('disconnect', () => handleDisconnect(io, socket, activeUsers));
  });
}
