import axiosInstance from '../utils/axiosInstance.js';
import API_PATHS from '../utils/apiPaths.js';

/**
 * Service for room-related API calls
 */

// Get active rooms via REST API (fallback/initial load)
export const getActiveRooms = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.ROOMS.GET_ACTIVE);
    return response; // axiosInstance already returns response.data
  } catch (error) {
    console.error('Error fetching active rooms:', error);
    throw error;
  }
};

// Create a new room
export const createRoom = async (roomData) => {
  try {
    const response = await axiosInstance.post(API_PATHS.ROOMS.CREATE, roomData);
    return response; // axiosInstance already returns response.data
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

// Join a room
export const joinRoom = async (roomId) => {
  try {
    const response = await axiosInstance.post(API_PATHS.ROOMS.JOIN(roomId));
    return response; // axiosInstance already returns response.data
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
};

// Get room details
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
