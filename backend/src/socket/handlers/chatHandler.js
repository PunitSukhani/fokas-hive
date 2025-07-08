export const handleSendMessage = async (io, socket, { roomId, message }) => {
  try {
    const messageData = {
      userId: socket.user.id,
      name: socket.user.name,
      message,
      timestamp: new Date()
    };
    
    // Broadcast message to room
    io.to(roomId).emit('new-message', messageData);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};
