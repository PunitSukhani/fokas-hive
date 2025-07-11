import express from 'express';
import { createRoom, getRooms, getRoom, joinRoom, getActiveRooms, getAllRoomsDebug, cleanupEmptyRooms } from '../controllers/roomController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// All room routes are protected
router.use(auth);

// Create a new room
router.post('/', createRoom);

// Get all rooms
router.get('/', getRooms);

// Get active rooms (rooms with at least one user)
router.get('/active', getActiveRooms);

// Debug endpoint - get all rooms including empty ones  
router.get('/debug/all', getAllRoomsDebug);

// Cleanup endpoint - remove empty rooms
router.post('/debug/cleanup', cleanupEmptyRooms);

// Get room by id
router.get('/:id', getRoom);

// Join a room
router.post('/:roomId/join', joinRoom);

export default router;
