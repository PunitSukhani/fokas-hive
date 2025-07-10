import Ably from 'ably';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Ably with server-side API key
const ably = new Ably.Realtime({
  key: process.env.ABLY_API_KEY || 'your-ably-api-key-here',
  // Use server-side configuration for publishing
  clientId: 'study-room-server'
});

// Channel names constants (match frontend)
export const CHANNELS = {
  ACTIVE_ROOMS: 'active-rooms',
  ROOM_UPDATES: 'room-updates',
  USER_PRESENCE: 'user-presence'
};

/**
 * Publish active rooms update to all connected clients
 * @param {Array} rooms - Array of active room objects
 */
export const publishActiveRooms = async (rooms) => {
  try {
    const channel = ably.channels.get(CHANNELS.ACTIVE_ROOMS);
    await channel.publish('rooms-updated', rooms);
    console.log(`[Ably] Published ${rooms.length} active rooms`);
  } catch (error) {
    console.error('[Ably] Error publishing active rooms:', error);
  }
};

/**
 * Publish room update event
 * @param {string} eventType - Type of room event (created, updated, deleted)
 * @param {Object} roomData - Room data
 */
export const publishRoomUpdate = async (eventType, roomData) => {
  try {
    const channel = ably.channels.get(CHANNELS.ROOM_UPDATES);
    await channel.publish(eventType, roomData);
    console.log(`[Ably] Published room ${eventType}:`, roomData.name);
  } catch (error) {
    console.error(`[Ably] Error publishing room ${eventType}:`, error);
  }
};

/**
 * Publish user presence update
 * @param {string} eventType - Type of presence event (user-joined, user-left)
 * @param {Object} presenceData - User presence data
 */
export const publishUserPresence = async (eventType, presenceData) => {
  try {
    const channel = ably.channels.get(CHANNELS.USER_PRESENCE);
    await channel.publish(eventType, presenceData);
    console.log(`[Ably] Published user presence ${eventType}:`, presenceData.userName);
  } catch (error) {
    console.error(`[Ably] Error publishing user presence ${eventType}:`, error);
  }
};

/**
 * Generate Ably token for client authentication
 * @param {string} clientId - Client identifier
 * @returns {Promise<Object>} Token data
 */
export const generateClientToken = async (clientId) => {
  try {
    const tokenRequest = await ably.auth.createTokenRequest({ 
      clientId,
      capability: {
        [CHANNELS.ACTIVE_ROOMS]: ['subscribe'],
        [CHANNELS.ROOM_UPDATES]: ['subscribe'],
        [CHANNELS.USER_PRESENCE]: ['subscribe']
      }
    });
    return tokenRequest;
  } catch (error) {
    console.error('[Ably] Error generating client token:', error);
    throw error;
  }
};

export default ably;
