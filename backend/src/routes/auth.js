import express from 'express';
import { signup, login, getMe, logout } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/logout', auth, logout);

export default router;
