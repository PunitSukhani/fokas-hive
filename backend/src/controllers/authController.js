import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config.js';

/**
 * Authentication Controller
 * 
 * Handles user authentication endpoints including:
 * - User registration with password hashing
 * - User login with JWT token generation
 * - User profile retrieval
 * - Logout with cookie cleanup
 * 
 * Security features:
 * - Password hashing with bcrypt
 * - JWT tokens stored in HTTP-only cookies
 * - Email uniqueness validation
 * - Secure cookie configuration for production
 */

// Cookie options for JWT token from config
const cookieOptions = config.SESSION.COOKIE_OPTIONS;

/**
 * Register a new user account
 * @param {Object} req - Express request object
 * @param {string} req.body.name - User's display name
 * @param {string} req.body.email - User's email address (must be unique)
 * @param {string} req.body.password - User's password (will be hashed)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user data or error message
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: config.SESSION.JWT_EXPIRY });
    
    // Set JWT as HTTP-only cookie
    res.cookie('token', token, cookieOptions);
    
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Log in an existing user
 * @param {Object} req - Express request object
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user data or error message
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    console.log('Login attempt for email:', email);
    
    // Check if JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('User found, checking password...');
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('Password mismatch for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Password verified, generating token...');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: config.SESSION.JWT_EXPIRY });
    
    // Set JWT as HTTP-only cookie
    res.cookie('token', token, cookieOptions);
    
    console.log('Login successful for user:', user.email);
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get the profile of the logged-in user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user data or error message
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Log out the current user
 * Clears the authentication cookie
 * @param {Object} req - Express request object 
 * @param {Object} res - Express response object
 * @returns {Object} JSON response confirming logout
 */
export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
