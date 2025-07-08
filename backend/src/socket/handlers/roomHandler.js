import Room from '../../models/Room.js';

export const handleJoinRoom = async (io, socket, { roomId }) => {
  try {
    // Find room
    const room = await Room.findById(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    // Add user to room
    const userIndex = room.users.findIndex(
      (u) => u.userId.toString() === socket.user.id.toString()
    );
    
    if (userIndex === -1) {
      // Add user if not in room
      room.users.push({
        userId: socket.user.id,
        name: socket.user.name,
        socketId: socket.id,
        joinedAt: new Date()
      });
    } else {
      // Update socket ID if already in room
      room.users[userIndex].socketId = socket.id;
    }
    
    await room.save();
    
    // Join socket room
    socket.join(roomId);
    
    // Broadcast updated user list to room
    io.to(roomId).emit('user-list-updated', room.users);
    
    // Send room data to user
    socket.emit('room-joined', room);
    
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
