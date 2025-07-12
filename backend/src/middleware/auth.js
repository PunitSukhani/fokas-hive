import jwt from 'jsonwebtoken';

/**
 * Authentication Middleware
 * 
 * Express middleware for protecting routes that require authentication.
 * Verifies JWT tokens from cookies (preferred) or Authorization header (fallback).
 * Attaches authenticated user data to the request object.
 * 
 * Token sources (in order of preference):
 * 1. HTTP-only cookies (secure, preferred for web clients)
 * 2. Authorization header with Bearer token (for API clients)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Next middleware function
 * @returns {Object} 401 response if authentication fails, otherwise calls next()
 */
export const auth = (req, res, next) => {
  try {
    // Check for token in cookies first (preferred)
    const token = req.cookies.token;
    
    // Fallback to Authorization header for API clients that don't support cookies
    const headerToken = req.headers.authorization?.split(' ')[1];
    
    if (!token && !headerToken) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token (use cookie token first, then header token as fallback)
    const decoded = jwt.verify(token || headerToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
