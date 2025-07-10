import { useEffect, useState, useCallback } from 'react';
import ably, { CHANNELS } from '../config/ably.js';
import { getActiveRooms as fetchActiveRooms } from '../services/roomService.js';

/**
 * Custom hook for Ably real-time messaging
 * @param {string} channelName - The channel to subscribe to
 * @returns {Object} Channel instance, connection state, and helper methods
 */
const useAbly = (channelName) => {
  const [channel, setChannel] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Get or create channel
    const ablyChannel = ably.channels.get(channelName);
    setChannel(ablyChannel);

    // Set up connection state listeners
    const handleConnected = () => {
      console.log(`[Ably] Connected to channel: ${channelName}`);
      setIsConnected(true);
      setConnectionError(null);
    };

    const handleDisconnected = () => {
      console.log(`[Ably] Disconnected from channel: ${channelName}`);
      setIsConnected(false);
    };

    const handleFailed = (error) => {
      console.error(`[Ably] Connection failed for channel: ${channelName}`, error);
      setConnectionError(error.message);
      setIsConnected(false);
    };

    const handleSuspended = () => {
      console.warn(`[Ably] Connection suspended for channel: ${channelName}`);
      setIsConnected(false);
    };

    ably.connection.on('connected', handleConnected);
    ably.connection.on('disconnected', handleDisconnected);
    ably.connection.on('failed', handleFailed);
    ably.connection.on('suspended', handleSuspended);

    // Check current connection state
    if (ably.connection.state === 'connected') {
      setIsConnected(true);
    }

    // Cleanup on unmount
    return () => {
      // Wrap cleanup in try-catch to prevent errors from breaking the component
      try {
        ably.connection.off('connected', handleConnected);
        ably.connection.off('disconnected', handleDisconnected);
        ably.connection.off('failed', handleFailed);
        ably.connection.off('suspended', handleSuspended);
        
        // Properly release the channel using the correct pattern
        if (ablyChannel) {
          try {
            // Unsubscribe from all events
            ablyChannel.unsubscribe();
            
            // Check if channel is attached before trying to detach
            if (ablyChannel.state === 'attached') {
              ablyChannel.once("attached", () => {
                ablyChannel.detach();
                ablyChannel.once("detached", () => {
                  try {
                    ably.channels.release(channelName);
                  } catch (releaseError) {
                    console.warn('[Ably] Error releasing channel:', releaseError);
                  }
                });
              });
            } else if (ablyChannel.state === 'detached' || ablyChannel.state === 'initialized') {
              // If not attached, just release directly
              try {
                ably.channels.release(channelName);
              } catch (releaseError) {
                console.warn('[Ably] Error releasing channel:', releaseError);
              }
            }
          } catch (error) {
            console.error('[Ably] Error during channel cleanup:', error);
            // Force release even if there's an error
            try {
              ably.channels.release(channelName);
            } catch (releaseError) {
              console.error('[Ably] Error releasing channel:', releaseError);
            }
          }
        }
      } catch (cleanupError) {
        console.error('[Ably] Critical error during cleanup:', cleanupError);
      }
    };
  }, [channelName]);

  // Subscribe to messages
  const subscribe = useCallback((eventName, callback) => {
    if (channel) {
      console.log(`[Ably] Subscribing to event: ${eventName} on channel: ${channelName}`);
      channel.subscribe(eventName, callback);
    }
  }, [channel, channelName]);

  // Unsubscribe from messages
  const unsubscribe = useCallback((eventName, callback) => {
    if (channel) {
      console.log(`[Ably] Unsubscribing from event: ${eventName} on channel: ${channelName}`);
      channel.unsubscribe(eventName, callback);
    }
  }, [channel, channelName]);

  // Publish message
  const publish = useCallback((eventName, data) => {
    if (channel && isConnected) {
      console.log(`[Ably] Publishing event: ${eventName} on channel: ${channelName}`, data);
      return channel.publish(eventName, data);
    } else {
      console.warn(`[Ably] Cannot publish - channel not connected: ${channelName}`);
      return Promise.reject(new Error('Channel not connected'));
    }
  }, [channel, isConnected, channelName]);

  return {
    channel,
    isConnected,
    connectionError,
    subscribe,
    unsubscribe,
    publish
  };
};

/**
 * Hook specifically for active rooms updates
 */
export const useActiveRooms = () => {
  const [activeRooms, setActiveRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { subscribe, unsubscribe, isConnected } = useAbly(CHANNELS.ACTIVE_ROOMS);

  // Fetch initial data via REST API
  const fetchInitialRooms = useCallback(async () => {
    try {
      setLoading(true);
      const rooms = await fetchActiveRooms();
      setActiveRooms(rooms || []);
      setError(null);
    } catch (error) {
      console.error('[REST] Error fetching initial rooms:', error);
      setError(error.message);
      setActiveRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch initial data
    fetchInitialRooms();

    const handleRoomsUpdate = (message) => {
      console.log('[Ably] Received active rooms update:', message.data);
      setActiveRooms(message.data || []);
      setLoading(false);
      setError(null);
    };

    const handleError = (error) => {
      console.error('[Ably] Active rooms error:', error);
      setError(error.message);
      setLoading(false);
    };

    if (isConnected) {
      subscribe('rooms-updated', handleRoomsUpdate);
      subscribe('error', handleError);
    }

    return () => {
      if (isConnected) {
        unsubscribe('rooms-updated', handleRoomsUpdate);
        unsubscribe('error', handleError);
      }
    };
  }, [subscribe, unsubscribe, isConnected, fetchInitialRooms]);

  return {
    activeRooms,
    loading,
    error,
    isConnected,
    refetch: fetchInitialRooms
  };
};

/**
 * Hook for user presence updates
 */
export const useUserPresence = () => {
  const [userPresence, setUserPresence] = useState({});
  const { subscribe, unsubscribe, isConnected } = useAbly(CHANNELS.USER_PRESENCE);

  useEffect(() => {
    const handleUserJoined = (message) => {
      console.log('[Ably] User joined:', message.data);
      const { userId, userName, roomId, roomName } = message.data;
      setUserPresence(prev => ({
        ...prev,
        [userId]: { userName, roomId, roomName, status: 'joined', timestamp: new Date() }
      }));
    };

    const handleUserLeft = (message) => {
      console.log('[Ably] User left:', message.data);
      const { userId, userName, roomId, roomName } = message.data;
      setUserPresence(prev => ({
        ...prev,
        [userId]: { userName, roomId, roomName, status: 'left', timestamp: new Date() }
      }));
    };

    if (isConnected) {
      subscribe('user-joined', handleUserJoined);
      subscribe('user-left', handleUserLeft);
    }

    return () => {
      unsubscribe('user-joined', handleUserJoined);
      unsubscribe('user-left', handleUserLeft);
    };
  }, [subscribe, unsubscribe, isConnected]);

  return {
    userPresence,
    isConnected
  };
};

export default useAbly;