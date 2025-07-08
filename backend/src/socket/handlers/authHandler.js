import jwt from 'jsonwebtoken';
import User from '../../models/User.js';

export const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) return next(new Error('User not found'));
    
    // Attach user data to socket
    socket.user = {
      id: user._id,
      name: user.name,
      email: user.email
    };
    next();
  } catch (error) {
    return next(new Error('Authentication error'));
  }
};
