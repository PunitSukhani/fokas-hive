import Room from '../models/Room.js';
import User from '../models/User.js';
import { getSocketInstance } from '../utils/socketInstance.js';
import { broadcastActiveRooms } from '../socket/handlers/roomHandler.js';

/**
 * Room Controller - API endpoints for room management
 * 
 * Handles HTTP requests for room operations including:
 * - Creating new rooms with timer settings
 * - Joining existing rooms
 * - Fetching room details and active rooms list
 * 
 * All endpoints require authentication via JWT middleware.
 * Integrates with Socket.IO for real-time updates.
 */

/**
 * Calculate current timer state based on elapsed time
 * Updates timeRemaining if timer is running based on actual elapsed time
 * @param {Object} timerState - Current timer state from database
 * @returns {Object} Updated timer state with current timeRemaining
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
 * Helper function to format rooms for frontend consumption
 * Calculates current timer states and formats user data
 * @param {Array} rooms - Array of room documents from MongoDB
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
 * Helper function to broadcast active rooms to all connected clients via Socket.IO
 * Fetches current active rooms from database and emits to all connected clients
 * @returns {Promise<Array>} Promise resolving to formatted rooms array
 * @throws {Error} If database query or broadcast fails
 */
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
    
    return formattedRooms;
  } catch (error) {
    console.error('Error broadcasting active rooms:', error);
    throw error;
  }
};

/**
 * API endpoint to create a new room
 * 
 * Creates a new room with the authenticated user as host.
 * Validates room name uniqueness and timer duration settings.
 * Automatically joins the creator to the room.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.body.name - Room name (required, must be unique)
 * @param {number} req.body.focusDuration - Focus session duration in minutes (default: 25)
 * @param {number} req.body.shortBreakDuration - Short break duration in minutes (default: 5)
 * @param {number} req.body.longBreakDuration - Long break duration in minutes (default: 15)
 * @param {Object} req.user - Authenticated user data from auth middleware
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created room data or error message
 */
export const createRoom = async (req, res) => {
  try {
    const { 
      name, 
      focusDuration = 25, 
      shortBreakDuration = 5, 
      longBreakDuration = 15 
    } = req.body;
    
    if (!name) return res.status(400).json({ message: 'Room name required' });
    
    // Validate timer durations (in minutes)
    if (focusDuration < 1 || focusDuration > 180) {
      return res.status(400).json({ message: 'Focus duration must be between 1 and 180 minutes' });
    }
    if (shortBreakDuration < 1 || shortBreakDuration > 60) {
      return res.status(400).json({ message: 'Short break duration must be between 1 and 60 minutes' });
    }
    if (longBreakDuration < 1 || longBreakDuration > 180) {
      return res.status(400).json({ message: 'Long break duration must be between 1 and 180 minutes' });
    }
    
    // Check if room exists
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) return res.status(409).json({ message: 'Room name already in use' });
    
    // Get user info to ensure we have the name
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Convert minutes to seconds for storage
    const focusSeconds = focusDuration * 60;
    const shortBreakSeconds = shortBreakDuration * 60;
    const longBreakSeconds = longBreakDuration * 60;
    
    // Create new room with user as host and custom timer settings
    const room = await Room.create({
      name,
      host: req.user.id,
      timerSettings: {
        focusDuration: focusSeconds,
        shortBreakDuration: shortBreakSeconds,
        longBreakDuration: longBreakSeconds
      },
      timerState: {
        mode: 'focus',
        timeRemaining: focusSeconds, // Initialize with focus duration
        isRunning: false,
        cycleCount: 0,
        startedAt: null,
        pausedAt: null
      },
      users: [{
        userId: req.user.id,
        name: user.name,
      }]
    });
    
    // Populate the host field for the response
    await room.populate('host', 'name email');
    
    // Broadcast updated active rooms to all connected clients
    await broadcastActiveRoomsToAll();
    
    res.status(201).json(room);
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a list of all rooms
 * 
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Array} List of room objects
 */
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('host', 'name email');
    res.json(rooms);
  } catch (err) {
    console.error('Error getting rooms:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Debug endpoint to get all rooms including empty ones
 * 
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} Debug information including all rooms
 */
export const getAllRoomsDebug = async (req, res) => {
  try {
    const allRooms = await Room.find().populate('host', 'name email');
    const roomsInfo = allRooms.map(room => ({
      id: room._id,
      name: room.name,
      host: room.host,
      userCount: room.users.length,
      createdAt: room.createdAt,
      users: room.users.map(u => ({ 
        userId: u.userId, 
        name: u.name, 
        socketId: u.socketId,
        joinedAt: u.joinedAt 
      }))
    }));
    
    console.log(`[DEBUG] Total rooms in database: ${allRooms.length}`);
    console.log('[DEBUG] Rooms details:', roomsInfo);
    
    res.json({
      totalRooms: allRooms.length,
      rooms: roomsInfo
    });
  } catch (err) {
    console.error('Error getting all rooms for debug:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Cleanup endpoint to remove empty rooms
 * 
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} Cleanup result including deleted rooms
 */
export const cleanupEmptyRooms = async (req, res) => {
  try {
    const emptyRooms = await Room.find({ 
      $or: [
        { users: { $size: 0 } },
        { users: { $exists: false } }
      ]
    });
    
    console.log(`[CLEANUP] Found ${emptyRooms.length} empty rooms to delete`);
    
    const deletedRooms = [];
    for (const room of emptyRooms) {
      console.log(`[CLEANUP] Deleting empty room: ${room.name} (${room._id})`);
      await Room.findByIdAndDelete(room._id);
      deletedRooms.push({ id: room._id, name: room.name });
    }
    
    console.log(`[CLEANUP] Cleanup complete. Deleted ${deletedRooms.length} rooms`);
    
    res.json({
      message: `Cleanup complete. Deleted ${deletedRooms.length} empty rooms.`,
      deletedRooms: deletedRooms
    });
  } catch (err) {
    console.error('Error during cleanup:', err);
    res.status(500).json({ message: 'Server error during cleanup' });
  }
};



/**
 * Get details of a specific room
 * 
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} Room object with user details
 */
export const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('host', 'name email')
      .populate('users.userId', 'name email'); // Populate user details in the users array
    
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    // Calculate current timer state if timer is running
    const currentTimerState = calculateCurrentTimerState(room.timerState);
    
    // Format the response to include user details properly
    const formattedRoom = {
      ...room.toObject(),
      timerState: currentTimerState,
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

/**
 * Join an existing room
 * 
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} Updated room object with joined user
 */
export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    // Check if user is already in room
    const isInRoom = room.users.some(user => user.userId.toString() === userId);
    if (isInRoom) {
      // User already in room, populate and return
      await room.populate('host', 'name email');
      await room.populate('users.userId', 'name email');
      
      // Calculate current timer state if timer is running
      const currentTimerState = calculateCurrentTimerState(room.timerState);
      
      // Format the response to include user details properly
      const formattedRoom = {
        ...room.toObject(),
        timerState: currentTimerState,
        users: room.users.map(user => ({
          id: user.userId?._id || user.userId,
          _id: user.userId?._id || user.userId,
          name: user.userId?.name || user.name,
          email: user.userId?.email,
          joinedAt: user.joinedAt,
          socketId: user.socketId
        }))
      };
      
      return res.json(formattedRoom);
    }
    
    // Get user info
    const user = await User.findById(userId);
    
    // Add user to room
    room.users.push({
      userId,
      name: user.name,
      joinedAt: new Date()
    });
    
    await room.save();
    
    // Populate user data for consistent response
    await room.populate('host', 'name email');
    await room.populate('users.userId', 'name email');
    
    // Calculate current timer state if timer is running
    const currentTimerState = calculateCurrentTimerState(room.timerState);
    
    // Format the response to include user details properly
    const formattedRoom = {
      ...room.toObject(),
      timerState: currentTimerState,
      users: room.users.map(user => ({
        id: user.userId?._id || user.userId,
        _id: user.userId?._id || user.userId,
        name: user.userId?.name || user.name,
        email: user.userId?.email,
        joinedAt: user.joinedAt,
        socketId: user.socketId
      }))
    };
    
    // Broadcast updated active rooms to all connected clients
    await broadcastActiveRoomsToAll();
    
    res.json(formattedRoom);
  } catch (err) {
    console.error('Error joining room:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a list of active rooms
 * 
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Array} List of active room objects
 */
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
