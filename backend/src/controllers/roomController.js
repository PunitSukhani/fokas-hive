import Room from '../models/Room.js';
import User from '../models/User.js';
import { getSocketInstance } from '../utils/socketInstance.js';
import { broadcastActiveRooms } from '../socket/handlers/roomHandler.js';
import { publishActiveRooms, publishRoomUpdate } from '../services/ablyService.js';

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

// Helper function to broadcast active rooms via both Socket.IO and Ably
const broadcastActiveRoomsToAll = async () => {
  try {
    // Get active rooms with populated user data
    const activeRooms = await Room.find({ 
      'users.0': { $exists: true } 
    })
    .populate('host', 'name email')
    .populate('users.userId', 'name email');
    
    const formattedRooms = formatRoomsForFrontend(activeRooms);
    
    // Broadcast via Socket.IO (existing functionality)
    const io = getSocketInstance();
    if (io) {
      broadcastActiveRooms(io);
    }
    
    // Publish via Ably (new functionality)
    await publishActiveRooms(formattedRooms);
    
    return formattedRooms;
  } catch (error) {
    console.error('Error broadcasting active rooms:', error);
    throw error;
  }
};

export const createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Room name required' });
    
    // Check if room exists
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) return res.status(409).json({ message: 'Room name already in use' });
    
    // Get user info to ensure we have the name
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Create new room with user as host
    const room = await Room.create({
      name,
      host: req.user.id,
      users: [{
        userId: req.user.id,
        name: user.name,
      }]
    });
    
    // Populate the host field for the response
    await room.populate('host', 'name email');
    
    // Broadcast updated active rooms to all connected clients
    await broadcastActiveRoomsToAll();
    
    // Publish room creation event
    await publishRoomUpdate('room-created', {
      id: room._id,
      name: room.name,
      host: room.host,
      userCount: room.users.length
    });
    
    res.status(201).json(room);
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('host', 'name email');
    res.json(rooms);
  } catch (err) {
    console.error('Error getting rooms:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('host', 'name email')
      .populate('users.userId', 'name email'); // Populate user details in the users array
    
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    // Format the response to include user details properly
    const formattedRoom = {
      ...room.toObject(),
      users: room.users.map(user => ({
        id: user.userId?._id || user.userId,
        _id: user.userId?._id || user.userId,
        name: user.userId?.name || user.name,
        email: user.userId?.email,
        joinedAt: user.joinedAt,
        socketId: user.socketId
      }))
    };
    
    res.json(formattedRoom);
  } catch (err) {
    console.error('Error getting room:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    // Check if user is already in room
    const isInRoom = room.users.some(user => user.userId.toString() === userId);
    if (isInRoom) return res.json(room); // User already in room
    
    // Get user info
    const user = await User.findById(userId);
    
    // Add user to room
    room.users.push({
      userId,
      name: user.name,
      joinedAt: new Date()
    });
    
    await room.save();
    
    // Broadcast updated active rooms to all connected clients
    await broadcastActiveRoomsToAll();
    
    res.json(room);
  } catch (err) {
    console.error('Error joining room:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// New endpoint for getting active rooms via REST API
export const getActiveRooms = async (req, res) => {
  try {
    console.log('[REST] Get active rooms request');
    
    // Find all rooms that have at least one user with populated data
    const activeRooms = await Room.find({ 
      'users.0': { $exists: true } 
    })
    .populate('host', 'name email')
    .populate('users.userId', 'name email');
    
    const formattedRooms = formatRoomsForFrontend(activeRooms);
    
    console.log(`[REST] Returning ${formattedRooms.length} active rooms`);
    res.json(formattedRooms);
  } catch (err) {
    console.error('Error getting active rooms:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
