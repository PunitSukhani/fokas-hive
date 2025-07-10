import express from 'express';
import { signup, login, getMe, logout } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import { generateClientToken } from '../services/ablyService.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/logout', auth, logout);

// Ably token endpoint for client authentication
router.get('/ably-token', auth, async (req, res) => {
  try {
    const clientId = `user-${req.user.id}`;
    const tokenRequest = await generateClientToken(clientId);
    res.json(tokenRequest);
  } catch (error) {
    console.error('Error generating Ably token:', error);
    res.status(500).json({ message: 'Failed to generate Ably token' });
  }
});

export default router;
