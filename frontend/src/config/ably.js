import { Realtime } from 'ably';
import axiosInstance from '../utils/axiosInstance.js';

// Ably configuration
const ABLY_API_KEY = import.meta.env.VITE_ABLY_API_KEY || 'your-ably-api-key-here';

// Token-based auth function for production
const authCallback = async (tokenParams, callback) => {
  try {
    console.log('[Ably] Requesting token from server...');
    const response = await axiosInstance.get('/api/auth/ably-token');
    console.log('[Ably] Token received successfully');
    callback(null, response.data);
  } catch (error) {
    console.error('Failed to get Ably token:', error);
    // Fallback to API key if token auth fails
    if (ABLY_API_KEY && ABLY_API_KEY !== 'your-ably-api-key-here') {
      console.warn('[Ably] Falling back to API key authentication');
      callback(null, { token: null, key: ABLY_API_KEY });
    } else {
      callback(error, null);
    }
  }
};

// Create Ably instance with conditional authentication
const ably = new Realtime({
  // Use API key for development, token auth for production
  ...(import.meta.env.DEV 
    ? { key: ABLY_API_KEY } 
    : { authCallback }
  ),
  autoConnect: true,
  disconnectedRetryTimeout: 5000,
  suspendedRetryTimeout: 5000
});

// Add connection event logging for debugging
ably.connection.on('connected', () => {
  console.log('[Ably] Connection established successfully');
});

ably.connection.on('failed', (error) => {
  console.error('[Ably] Connection failed:', error);
});

ably.connection.on('disconnected', () => {
  console.warn('[Ably] Connection disconnected');
});

ably.connection.on('suspended', () => {
  console.warn('[Ably] Connection suspended');
});

// Channel names constants
export const CHANNELS = {
  ACTIVE_ROOMS: 'active-rooms',
  ROOM_UPDATES: 'room-updates',
  USER_PRESENCE: 'user-presence'
};

export default ably;