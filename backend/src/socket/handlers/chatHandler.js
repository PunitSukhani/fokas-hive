import Room from '../../models/Room.js';

export const handleSendMessage = async (io, socket, { roomId, message }) => {
  try {
    // Validate input
    if (!roomId || !message) {
      socket.emit('error', { message: 'Room ID and message are required' });
      return;
    }

    // Validate message content
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      socket.emit('error', { message: 'Message cannot be empty' });
      return;
    }

    if (trimmedMessage.length > 500) {
      socket.emit('error', { message: 'Message too long (max 500 characters)' });
      return;
    }

    // Verify room exists and user is in it
    const room = await Room.findById(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    // Check if user is in the room
    const isUserInRoom = room.users.some(user => 
      user.userId && user.userId.toString() === socket.user.id.toString()
    );

    if (!isUserInRoom) {
      socket.emit('error', { message: 'You are not in this room' });
      return;
    }

    // Create message data
    const messageData = {
      id: `${Date.now()}-${socket.user.id}`, // Simple ID generation
      userId: socket.user.id,
      name: socket.user.name || socket.user.email || 'Unknown User',
      message: trimmedMessage,
      timestamp: new Date(),
      type: 'user'
    };

    console.log(`[Chat] Message from ${socket.user.name || 'Unknown'} (${socket.user.id}) in room ${roomId}: ${trimmedMessage}`);
    
    // Broadcast message to room (including sender)
    io.to(roomId).emit('new-message', messageData);
  } catch (error) {
    console.error('Error sending message:', error);
    socket.emit('error', { message: 'Failed to send message' });
  }
};
