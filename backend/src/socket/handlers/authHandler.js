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
    if (!token && socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
    }
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

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
    console.error('Socket authentication error:', error);
    return next(new Error('Authentication error'));
  }
};
