/**
 * API Paths Configuration
 * 
 * Centralized configuration for all API endpoints used in the FokasHive application.
 * Provides consistent URL management and easy endpoint maintenance.
 * 
 * Structure:
 * - AUTH: User authentication endpoints
 * - USER: User profile and account management
 * - ROOMS: Focus room management endpoints
 * 
 * Dynamic endpoints use functions that accept IDs and return formatted URLs.
 * Base URL is configurable for different environments (dev/prod).
 */

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const API_PATHS = {
  // Authentication endpoints
  AUTH: {
    REGISTER: "/auth/signup",         // POST - Create new user account
    LOGIN: "/auth/login",             // POST - User login with credentials
    LOGOUT: "/auth/logout",           // POST - User logout and cookie cleanup
    VERIFY: "/auth/me",               // GET - Verify JWT token validity
    GET_PROFILE: "/auth/me",          // GET - Get current user profile
  },

  // User management endpoints
  USER: {
    UPDATE_PROFILE: "/users/profile",    // PUT - Update user profile information
    CHANGE_PASSWORD: "/users/password",  // POST - Change user password
    GET_STATISTICS: "/users/statistics", // GET - Get user study statistics
  },

  // Room management endpoints
  ROOMS: {
    CREATE: "/rooms",                     // POST - Create new focus room
    GET_ALL: "/rooms",                    // GET - Get all rooms (admin)
    GET_ACTIVE: "/rooms/active",          // GET - Get currently active rooms
    GET_ONE: (id) => `/rooms/${id}`,      // GET - Get specific room details
    JOIN: (id) => `/rooms/${id}/join`,    // POST - Join a specific room
  },
};

export default API_PATHS;
