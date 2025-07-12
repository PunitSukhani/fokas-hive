import dotenv from 'dotenv';
dotenv.config();

/**
 * Application Configuration
 * 
 * Central configuration object for the FokasHive backend application.
 * Manages environment variables and provides default values for:
 * 
 * - Server settings (port, database connection)
 * - Authentication & JWT configuration
 * - Session management settings
 * - CORS policy configuration
 * - Cookie security settings
 * 
 * Configuration is environment-aware with different settings for
 * development and production environments.
 */
export default {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  
  // Session configuration
  SESSION: {
    // JWT token expiry
    JWT_EXPIRY: '7d',
    
    // Cookie settings
    COOKIE_OPTIONS: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    },
    
    // Session timeout settings
    INACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutes in milliseconds
    SESSION_REFRESH_INTERVAL: 15 * 60 * 1000 // 15 minutes in milliseconds
  },
  
  // CORS settings for session management
  CORS: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : 'http://localhost:5173',
    credentials: true
  }
};
