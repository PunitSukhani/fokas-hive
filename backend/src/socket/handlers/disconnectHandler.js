import Room from '../../models/Room.js';
import { broadcastActiveRooms, deleteRoomIfEmpty } from './roomHandler.js';

/**
 * Socket Disconnect Handler
 * 
 * Manages cleanup when users disconnect from the Socket.IO server including:
 * - Removing users from all rooms they were in
 * - Updating room user lists and broadcasting changes
 * - Deleting empty rooms automatically
 * - Preventing duplicate notifications
 * - Updating active users tracking
 * 
 * This handler ensures clean state management when users lose connection
 * either intentionally (closing browser) or unintentionally (network issues).
 */

/**
 * Handle user disconnection cleanup
 * Removes user from all rooms and broadcasts updates
 * @param {Object} io - Socket.IO server instance
 * @param {Object} socket - Disconnecting socket
 * @param {Map} activeUsers - Map of active user IDs to socket IDs
 */
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
      
      const deletedRoomIds = new Set(); // Track deleted rooms to prevent duplicate processing
      
      // Remove user from each room
      for (const room of rooms) {
        // Skip if room was already deleted in a previous iteration
        if (deletedRoomIds.has(room._id.toString())) {
          continue;
        }
        
        room.users = room.users.filter(
          (u) => u.socketId !== socket.id
        );
        
        // Check if room is now empty and delete if so
        const wasDeleted = await deleteRoomIfEmpty(io, room);
        if (wasDeleted) {
          deletedRoomIds.add(room._id.toString());
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
        
        io.to(room._id.toString()).emit('user-list-updated', uniqueUsers);
        
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
