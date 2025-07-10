import Room from '../../models/Room.js';
import { broadcastActiveRooms } from './roomHandler.js';

export const handleDisconnect = async (io, socket, activeUsers) => {
  console.log('User disconnected:', socket.id);
  
  if (socket.user) {
    // Remove from active users
    activeUsers.delete(socket.user.id.toString());
    
    try {
      // Find all rooms user is in
      const rooms = await Room.find({
        'users.userId': socket.user.id,
        'users.socketId': socket.id
      });
      
      // Remove user from each room
      for (const room of rooms) {
        room.users = room.users.filter(
          (u) => u.socketId !== socket.id
        );
        
        // Check if room is now empty
        if (room.users.length === 0) {
          console.log(`[Disconnect] Room ${room.name} is empty, deleting it`);
          await Room.findByIdAndDelete(room._id);
          
          // Notify that room was deleted
          io.emit('room-deleted', { roomId: room._id, roomName: room.name });
          
          console.log(`[Disconnect] Deleted empty room: ${room.name}`);
          continue; // Skip further processing for deleted room
        }
        
        await room.save();
        
        // Broadcast updated user list (format for frontend)
        const formattedUsers = room.users.map(user => ({
          id: user.userId || user.userId,
          _id: user.userId || user.userId,
          name: user.name,
          joinedAt: user.joinedAt,
          socketId: user.socketId
        }));
        io.to(room._id.toString()).emit('user-list-updated', formattedUsers);
        
        // Notify others that user left
        io.to(room._id.toString()).emit('user-left', {
          userId: socket.user.id,
          name: socket.user.name
        });
      }
      
      // Broadcast updated active rooms to all clients
      await broadcastActiveRooms(io);
      
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }
};
