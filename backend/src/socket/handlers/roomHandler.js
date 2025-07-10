import Room from '../../models/Room.js';
import { publishActiveRooms, publishUserPresence } from '../../services/ablyService.js';

// Helper function to format rooms for frontend
const formatRoomsForFrontend = (rooms) => {
  return rooms.map(room => ({
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
    timerState: room.timerState,
    createdAt: room.createdAt
  }));
};

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
    
    console.log(`[Socket] Room found: ${room.name}`);

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
    }
    
    await room.save();
    console.log(`[Socket] Room saved with updated users`);
    
    // Join socket room
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
    io.to(roomId).emit('user-list-updated', formattedUsers);
    console.log(`[Socket] Emitted user-list-updated event with formatted users`);
    
    // Send room data to user (populate host data)
    await room.populate('host', 'name email');
    const formattedRoom = {
      ...room.toObject(),
      users: formattedUsers
    };
    socket.emit('room-joined', formattedRoom);
    console.log(`[Socket] Emitted room-joined event to socket ${socket.id}`);
    
    // Notify others that user joined
    socket.to(roomId).emit('user-joined', {
      userId: socket.user.id,
      name: socket.user.name
    });
    
    // Broadcast updated active rooms to all clients via both Socket.IO and Ably
    await broadcastActiveRooms(io);
    
    // Publish user presence via Ably
    await publishUserPresence('user-joined', {
      roomId: roomId,
      userId: socket.user.id,
      userName: socket.user.name,
      roomName: room.name
    });
    
  } catch (error) {
    console.error('Error joining room:', error);
    socket.emit('error', { message: 'Failed to join room' });
  }
};

export const handleLeaveRoom = async (io, socket, { roomId }) => {
  try {
    // Find room
    const room = await Room.findById(roomId);
    if (!room) return;
    
    // Remove user from room
    room.users = room.users.filter(
      (u) => u.userId.toString() !== socket.user.id.toString()
    );
    
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
    io.to(roomId).emit('user-list-updated', formattedUsers);
    
    // Notify others that user left
    socket.to(roomId).emit('user-left', {
      userId: socket.user.id,
      name: socket.user.name
    });
    
    // Broadcast updated active rooms to all clients
    await broadcastActiveRooms(io);
    
    // Publish user presence via Ably
    await publishUserPresence('user-left', {
      roomId: roomId,
      userId: socket.user.id,
      userName: socket.user.name,
      roomName: room.name
    });
    
  } catch (error) {
    console.error('Error leaving room:', error);
  }
};

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

// Helper function to broadcast active rooms to all connected clients
export const broadcastActiveRooms = async (io) => {
  try {
    const activeRooms = await Room.find({ 
      'users.0': { $exists: true } 
    }).populate('host', 'name email');
    
    const formattedRooms = formatRoomsForFrontend(activeRooms);
    
    // Broadcast via Socket.IO
    io.emit('active-rooms', formattedRooms);
    console.log(`[Socket] Broadcasted ${formattedRooms.length} active rooms to all clients`);
    
    // Publish via Ably
    await publishActiveRooms(formattedRooms);
    
  } catch (error) {
    console.error('Error broadcasting active rooms:', error);
  }
};
