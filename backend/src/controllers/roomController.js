import Room from '../models/Room.js';
import User from '../models/User.js';

export const createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Room name required' });
    
    // Check if room exists
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) return res.status(409).json({ message: 'Room name already in use' });
    
    // Create new room with user as host
    const room = await Room.create({
      name,
      host: req.user.id,
      users: [{
        userId: req.user.id,
        name: req.user.name,
      }]
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
    const room = await Room.findById(req.params.id).populate('host', 'name email');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
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
    res.json(room);
  } catch (err) {
    console.error('Error joining room:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
