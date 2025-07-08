import Room from '../../models/Room.js';

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
    
    // Broadcast updated user list to room
    io.to(roomId).emit('user-list-updated', room.users);
    console.log(`[Socket] Emitted user-list-updated event`);
    
    // Send room data to user
    socket.emit('room-joined', room);
    console.log(`[Socket] Emitted room-joined event to socket ${socket.id}`);
    
    // Notify others that user joined
    socket.to(roomId).emit('user-joined', {
      userId: socket.user.id,
      name: socket.user.name
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
    
    // Broadcast updated user list
    io.to(roomId).emit('user-list-updated', room.users);
    
    // Notify others that user left
    socket.to(roomId).emit('user-left', {
      userId: socket.user.id,
      name: socket.user.name
    });
    
  } catch (error) {
    console.error('Error leaving room:', error);
  }
};
