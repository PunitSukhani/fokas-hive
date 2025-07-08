import jwt from 'jsonwebtoken';

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
