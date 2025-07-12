import Room from '../../models/Room.js';

/**
 * Socket Room Handler
 * 
 * Handles Socket.IO events related to room management including:
 * - User joining and leaving rooms
 * - Broadcasting room updates
 * - Managing room lifecycle (creation/deletion)
 * - Real-time user list synchronization
 * 
 * Key features:
 * - Automatic cleanup of empty rooms
 * - Real-time user presence tracking
 * - Duplicate user prevention
 * - Broadcasting active rooms to all clients
 */

/**
 * Helper function to handle room deletion when empty
 * Prevents duplicate notifications and ensures clean room lifecycle
 * @param {Object} io - Socket.IO server instance
 * @param {Object} room - Room document to check and potentially delete
 * @returns {Promise<boolean>} True if room was deleted, false otherwise
 */
export const deleteRoomIfEmpty = async (io, room) => {
  if (!room || room.users.length > 0) {
    return false; // Room not deleted
  }
  
  console.log(`[Socket] Room ${room.name} is empty, deleting it`);
  await Room.findByIdAndDelete(room._id);
  
  // Notify that room was deleted
  io.emit('room-deleted', { roomId: room._id, roomName: room.name });
  
  console.log(`[Socket] Deleted empty room: ${room.name}`);
  return true; // Room was deleted
};

/**
 * Helper function to format rooms for frontend
 * @param {Array} rooms - Array of room documents to format
 * @returns {Array} Formatted room objects for frontend
 */
const formatRoomsForFrontend = (rooms) => {
  return rooms.map(room => {
    // Calculate current timer state if timer is running
    const currentTimerState = calculateCurrentTimerState(room.timerState);
    
    return {
      id: room._id,
      _id: room._id,
      name: room.name,
      host: room.host,
      userCount: room.users.length,
      users: room.users.map(user => ({
        id: user.userId?._id || user.userId,
        _id: user.userId?._id || user.userId,
        name: user.userId?.name || user.name,
        email: user.userId?.email,
        joinedAt: user.joinedAt
      })),
      timerState: currentTimerState,
      timerSettings: room.timerSettings,
      createdAt: room.createdAt
    };
  });
};

/**
 * Helper function to calculate current timer state
 * @param {Object} timerState - Timer state object from room document
 * @returns {Object} Updated timer state with calculated time remaining
 */
const calculateCurrentTimerState = (timerState) => {
  if (!timerState.isRunning || !timerState.startedAt) {
    return timerState;
  }
  
  const now = new Date();
  const startedAt = new Date(timerState.startedAt);
  const elapsedSeconds = Math.floor((now - startedAt) / 1000);
  const currentTimeRemaining = Math.max(0, timerState.timeRemaining - elapsedSeconds);
  
  return {
    ...timerState,
    timeRemaining: currentTimeRemaining
  };
};

/**
 * Handles user joining a room
 * - Validates and finds the room
 * - Adds or updates the user in the room
 * - Emits updated user list and room data to clients
 * - Notifies others in the room about the new user
 * - Broadcasts updated active rooms to all clients
 * @param {Object} io - Socket.IO server instance
 * @param {Object} socket - Socket instance of the user
 * @param {Object} param1 - Parameters containing roomId
 */
export const handleJoinRoom = async (io, socket, { roomId }) => {
  try {
    console.log(`[Socket] Join room attempt: ${roomId} by user:`, socket.user.id);
    
    // Find room
    const room = await Room.findById(roomId);
    if (!room) {
      console.log(`[Socket] Room not found: ${roomId}`);
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    console.log(`[Socket] Room found: ${room.name}, current users: ${room.users.length}`);

    // Add user to room
    const userIndex = room.users.findIndex(
      (u) => u.userId && u.userId.toString() === socket.user.id.toString()
    );
    
    console.log(`[Socket] User index in room: ${userIndex}`);
    
    if (userIndex === -1) {
      // Add user if not in room
      console.log(`[Socket] Adding user to room: ${socket.user.name}`);
      room.users.push({
        userId: socket.user.id,
        name: socket.user.name,
        socketId: socket.id,
        joinedAt: new Date()
      });
    } else {
      // Update socket ID if already in room
      console.log(`[Socket] Updating socket ID for user: ${socket.user.name}`);
      room.users[userIndex].socketId = socket.id;
      room.users[userIndex].name = socket.user.name; // Update name in case it changed
    }
    
    await room.save();
    console.log(`[Socket] Room saved with updated users`);
    
    // Join socket room FIRST before broadcasting events
    socket.join(roomId);
    console.log(`[Socket] Socket joined room: ${roomId}`);
    
    // Broadcast updated user list to room (format for frontend)
    const formattedUsers = room.users.map(user => ({
      id: user.userId || user.userId,
      _id: user.userId || user.userId,
      name: user.name,
      joinedAt: user.joinedAt,
      socketId: user.socketId
    }));
    
    // Remove any duplicates based on user ID before broadcasting
    const uniqueUsers = [];
    const seenUserIds = new Set();
    formattedUsers.forEach(user => {
      const userId = user.id || user._id;
      if (userId && !seenUserIds.has(userId.toString())) {
        seenUserIds.add(userId.toString());
        uniqueUsers.push(user);
      }
    });
    
    io.to(roomId).emit('user-list-updated', uniqueUsers);
    console.log(`[Socket] Emitted user-list-updated event with ${uniqueUsers.length} unique users`);
    
    // Send room data to user (populate host data)
    await room.populate('host', 'name email');
    
    // Calculate current timer state if timer is running
    const currentTimerState = calculateCurrentTimerState(room.timerState);
    
    const formattedRoom = {
      ...room.toObject(),
      timerState: currentTimerState,
      users: uniqueUsers
    };
    socket.emit('room-joined', formattedRoom);
    console.log(`[Socket] Emitted room-joined event to socket ${socket.id}`);
    
    // Notify others that user joined
    socket.to(roomId).emit('user-joined', {
      userId: socket.user.id,
      name: socket.user.name
    });
    
    // Broadcast updated active rooms to all clients
    await broadcastActiveRooms(io);
    
  } catch (error) {
    console.error('Error joining room:', error);
    socket.emit('error', { message: 'Failed to join room' });
  }
};

/**
 * Handles user leaving a room
 * - Validates and finds the room
 * - Removes the user from the room
 * - Deletes the room if it becomes empty
 * - Emits updated user list to remaining users
 * - Notifies others in the room about the user leaving
 * - Broadcasts updated active rooms to all clients
 * @param {Object} io - Socket.IO server instance
 * @param {Object} socket - Socket instance of the user
 * @param {Object} param1 - Parameters containing roomId
 */
export const handleLeaveRoom = async (io, socket, { roomId }) => {
  try {
    // Find room
    const room = await Room.findById(roomId);
    if (!room) return;
    
    // Remove user from room
    room.users = room.users.filter(
      (u) => u.userId.toString() !== socket.user.id.toString()
    );
    
    // Check if room is now empty and delete if so
    const wasDeleted = await deleteRoomIfEmpty(io, room);
    if (wasDeleted) {
      // Broadcast updated active rooms to all clients
      await broadcastActiveRooms(io);
      return;
    }
    
    await room.save();
    
    // Leave socket room
    socket.leave(roomId);
    
    // Broadcast updated user list (format for frontend)
    const formattedUsers = room.users.map(user => ({
      id: user.userId || user.userId,
      _id: user.userId || user.userId,
      name: user.name,
      joinedAt: user.joinedAt,
      socketId: user.socketId
    }));
    
    // Remove any duplicates based on user ID before broadcasting
    const uniqueUsers = [];
    const seenUserIds = new Set();
    formattedUsers.forEach(user => {
      const userId = user.id || user._id;
      if (userId && !seenUserIds.has(userId.toString())) {
        seenUserIds.add(userId.toString());
        uniqueUsers.push(user);
      }
    });
    
    io.to(roomId).emit('user-list-updated', uniqueUsers);
    
    // Notify others that user left
    socket.to(roomId).emit('user-left', {
      userId: socket.user.id,
      name: socket.user.name
    });
    
    // Broadcast updated active rooms to all clients
    await broadcastActiveRooms(io);
    
  } catch (error) {
    console.error('Error leaving room:', error);
  }
};

/**
 * Handles request for active rooms
 * - Retrieves all rooms with at least one user
 * - Formats room data for frontend
 * - Emits active rooms data to the requesting user
 * @param {Object} io - Socket.IO server instance
 * @param {Object} socket - Socket instance of the user
 */
export const handleGetActiveRooms = async (io, socket) => {
  try {
    console.log(`[Socket] Get active rooms request from user:`, socket.user.id);
    
    // Find all rooms that have at least one user
    const activeRooms = await Room.find({ 
      'users.0': { $exists: true } // Rooms with at least one user
    }).populate('host', 'name email');
    
    // Format rooms for frontend with user count and user info
    const formattedRooms = formatRoomsForFrontend(activeRooms);
    
    console.log(`[Socket] Sending ${formattedRooms.length} active rooms to user`);
    socket.emit('active-rooms', formattedRooms);
    
  } catch (error) {
    console.error('Error getting active rooms:', error);
    socket.emit('error', { message: 'Failed to get active rooms' });
  }
};

/**
 * Helper function to broadcast active rooms to all connected clients
 * - Retrieves all rooms with at least one user
 * - Formats room data for frontend
 * - Emits active rooms data to all clients
 * @param {Object} io - Socket.IO server instance
 */
export const broadcastActiveRooms = async (io) => {
  try {
    const activeRooms = await Room.find({ 
      'users.0': { $exists: true } 
    }).populate('host', 'name email');
    
    const formattedRooms = formatRoomsForFrontend(activeRooms);
    
    // Broadcast via Socket.IO
    io.emit('active-rooms', formattedRooms);
    console.log(`[Socket] Broadcasted ${formattedRooms.length} active rooms to all clients`);
    
  } catch (error) {
    console.error('Error broadcasting active rooms:', error);
  }
};
