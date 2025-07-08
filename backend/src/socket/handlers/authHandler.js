import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import cookie from 'cookie';

export const authenticateSocket = async (socket, next) => {
  try {
    let token;
    
    // Try to get token from cookies first
    if (socket.handshake.headers.cookie) {
      const cookies = cookie.parse(socket.handshake.headers.cookie);
      token = cookies.token;
    }
    
    // Fallback to auth object if no cookie
    if (!token && socket.handshake.auth && socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
    }
    
    // Check for token in query params (useful for Postman testing)
    if (!token && socket.handshake.query && socket.handshake.query.token) {
      token = String(socket.handshake.query.token).trim();
    }
    
    // Check if token exists
    if (!token) {
      return next(new Error('Authentication token is required'));
    }
    
    // Remove Bearer prefix if present
    if (token.startsWith('Bearer ')) {
      token = token.substring(7);
    }
    
    // Make sure token is a string
    token = String(token).trim();
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('User not found'));
    }
    
    // Attach user data to socket
    socket.user = {
      id: user._id,
      name: user.name,
      email: user.email
    };
    next();
  } catch (error) {
    return next(new Error(`Authentication error: ${error.message}`));
  }
};
