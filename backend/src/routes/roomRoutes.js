import express from 'express';
import { createRoom, getRooms, getRoom, joinRoom } from '../controllers/roomController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// All room routes are protected
router.use(auth);

// Create a new room
router.post('/', createRoom);

// Get all rooms
router.get('/', getRooms);

// Get room by id
router.get('/:id', getRoom);

// Join a room
router.post('/:roomId/join', joinRoom);

export default router;
