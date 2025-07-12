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
    origin: function(origin, callback) {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://fokas-hive.vercel.app',
        process.env.FRONTEND_URL
      ];
      
      // Allow requests with no origin
      if (!origin) return callback(null, true);
      
      // Allow any Vercel preview/deployment URLs for this project
      if (origin && (
        origin.includes('fokas-hive') && origin.includes('vercel.app') ||
        allowedOrigins.indexOf(origin) !== -1
      )) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true
  }
};
