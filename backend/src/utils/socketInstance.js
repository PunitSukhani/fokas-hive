/**
 * Socket Instance Utility
 * 
 * Global singleton pattern for managing the Socket.IO server instance.
 * Allows different parts of the application to access the same Socket.IO
 * instance for broadcasting events and managing real-time communication.
 * 
 * Usage:
 * - setSocketInstance() called once during server initialization
 * - getSocketInstance() called from controllers/handlers to emit events
 * 
 * This pattern ensures consistent real-time communication across
 * HTTP API endpoints and Socket.IO event handlers.
 */

// Global socket instance utility
let io = null;

/**
 * Set the global Socket.IO instance
 * Called once during server startup
 * @param {Object} socketInstance - Socket.IO server instance
 */
export const setSocketInstance = (socketInstance) => {
  io = socketInstance;
};

/**
 * Get the global Socket.IO instance
 * Used by controllers and other parts of the app to emit events
 * @returns {Object|null} Socket.IO server instance or null if not set
 */
export const getSocketInstance = () => {
  return io;
};
