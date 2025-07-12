import axiosInstance from '../utils/axiosInstance.js';
import API_PATHS from '../utils/apiPaths.js';

/**
 * Room Service - API calls for room management
 * 
 * Provides functions for all room-related operations including:
 * - Fetching active rooms
 * - Creating new rooms with timer settings
 * - Joining existing rooms
 * - Getting detailed room information
 * 
 * All functions use the configured axios instance with automatic
 * authentication and error handling.
 */

/**
 * Get list of all active rooms (rooms with at least one user)
 * @returns {Promise<Array>} Promise resolving to array of room objects
 * @throws {Error} If request fails or server error occurs
 */
export const getActiveRooms = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.ROOMS.GET_ACTIVE);
    return response; // axiosInstance already returns response.data
  } catch (error) {
    console.error('Error fetching active rooms:', error);
    throw error;
  }
};

/**
 * Create a new focus room with custom timer settings
 * @param {Object} roomData - Room configuration object
 * @param {string} roomData.name - Display name for the room
 * @param {number} roomData.focusDuration - Focus session duration in minutes
 * @param {number} roomData.shortBreakDuration - Short break duration in minutes  
 * @param {number} roomData.longBreakDuration - Long break duration in minutes
 * @returns {Promise<Object>} Promise resolving to created room object
 * @throws {Error} If room name already exists or validation fails
 */
export const createRoom = async (roomData) => {
  try {
    const response = await axiosInstance.post(API_PATHS.ROOMS.CREATE, roomData);
    return response; // axiosInstance already returns response.data
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

/**
 * Join an existing room by ID
 * Adds the current authenticated user to the room's user list
 * @param {string} roomId - MongoDB ObjectId of the room to join
 * @returns {Promise<Object>} Promise resolving to updated room object with user list
 * @throws {Error} If room not found or user already in room
 */
export const joinRoom = async (roomId) => {
  try {
    const response = await axiosInstance.post(API_PATHS.ROOMS.JOIN(roomId));
    return response; // axiosInstance already returns response.data
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
};

/**
 * Get detailed information about a specific room
 * Includes room settings, current users, timer state, and host information
 * @param {string} roomId - MongoDB ObjectId of the room
 * @returns {Promise<Object>} Promise resolving to detailed room object
 * @throws {Error} If room not found or access denied
 */
export const getRoomDetails = async (roomId) => {
  try {
    const response = await axiosInstance.get(API_PATHS.ROOMS.GET_ONE(roomId));
    return response; // axiosInstance already returns response.data
  } catch (error) {
    console.error('Error fetching room details:', error);
    throw error;
  }
};

export default {
  getActiveRooms,
  createRoom,
  joinRoom,
  getRoomDetails
};
