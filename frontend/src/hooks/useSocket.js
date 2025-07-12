import { useEffect, useState } from 'react';
import io from 'socket.io-client';

/**
 * Custom Hook for Socket.IO Connection Management
 * 
 * Manages Socket.IO connection lifecycle including:
 * - Automatic connection establishment
 * - Connection state tracking
 * - Error handling and reconnection
 * - Cleanup on component unmount
 * 
 * Features:
 * - Automatic authentication via cookies
 * - Connection status monitoring
 * - Error state management
 * - Manual reconnection capability
 * - Proper cleanup to prevent memory leaks
 * 
 * @param {string} url - Socket server URL to connect to
 * @param {Object} options - Additional Socket.IO options
 * @returns {Object} Socket connection state and methods
 * @returns {Object} socket - Socket.IO client instance
 * @returns {boolean} isConnected - Current connection status
 * @returns {string|null} connectionError - Error message if connection failed
 * @returns {Function} reconnect - Manual reconnection method
 */
const useSocket = (url, options = {}) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  useEffect(() => {
    // Create socket instance
    const socketInstance = io(url, {
      withCredentials: true,
      autoConnect: false,
      ...options
    });
    
    // Set socket in state
    setSocket(socketInstance);
    
    // Connect to socket
    socketInstance.connect();
    
    // Setup connection listeners
    socketInstance.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
    });
    
    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });
    
    socketInstance.on('connect_error', (err) => {
      setConnectionError(err.message || 'Connection error');
      setIsConnected(false);
    });
    
    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('connect_error');
    };
  }, [url]);
  
  // Method to manually reconnect
  const reconnect = () => {
    if (socket) {
      // Disconnect if already connected
      if (socket.connected) {
        socket.disconnect();
      }
      
      // Clear error state
      setConnectionError(null);
      
      // Try to reconnect
      setTimeout(() => {
        socket.connect();
      }, 500);
    }
  };
  
  return { 
    socket, 
    isConnected, 
    connectionError,
    reconnect 
  };
};

export default useSocket;
