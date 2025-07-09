// Authentication service for handling login, registration, and user session
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";
import { apiCall } from "../utils/apiUtils";

/**
 * Login with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise} Promise object with user data
 */
export const login = async (email, password) => {
  try {
    const result = await axiosInstance.post(API_PATHS.AUTH.LOGIN, { email, password });
    
    // The backend sets the cookie automatically
    // We only need to return the user data
    return result;
  } catch (error) {
    console.error('Login error:', error);
    
    // Return user-friendly error message
    // If the error has been processed by axiosInstance interceptor
    if (error.success === false) {
      return error;
    }
    
    return { 
      success: false, 
      error: 'Invalid login credentials. Please check your email and password.' 
    };
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data 
 * @returns {Promise} Promise object with registration result
 */
export const register = async (userData) => {
  return await apiCall('post', API_PATHS.AUTH.REGISTER, userData);
};

/**
 * Logout the current user
 * @returns {Promise} Promise that resolves when logout is complete
 */
export const logout = async () => {
  try {
    // Call the logout endpoint which will clear the cookie
    await apiCall('post', API_PATHS.AUTH.LOGOUT);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message || 'Logout failed. Please try again.' };
  }
};

/**
 * Get current user profile
 * @returns {Promise} Promise object with user profile data
 */
export const getCurrentUser = async () => {
  try {
    return await apiCall('get', API_PATHS.AUTH.GET_PROFILE);
  } catch (error) {
    console.error('Get user profile error:', error);
    return null;
  }
};

/**
 * Check if user is authenticated by verifying the token with the backend
 * @returns {Promise<boolean>} Promise resolving to authentication status
 */
export const isAuthenticated = async () => {
  try {
    const response = await verifyToken();
    return response.success;
  } catch (error) {
    return false;
  }
};

/**
 * Verify token validity with backend
 * @returns {Promise} Promise with verification result
 */
export const verifyToken = async () => {
  try {
    // Use the /auth/me endpoint to verify token by attempting to get the user profile
    const response = await apiCall('get', API_PATHS.AUTH.VERIFY);
    return response;
  } catch (error) {
    console.error('Token verification error:', error);
    return { success: false };
  }
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint to call
 * @param {string} method - HTTP method (get, post, put, delete)
 * @param {Object} data - Request body (for POST/PUT)
 * @param {Object} config - Additional axios config
 * @returns {Promise} Promise with the API response
 */
export const authenticatedRequest = async (endpoint, method = 'get', data = null, config = {}) => {
  // With cookie auth, we just need to make sure withCredentials is true
  const authConfig = {
    ...config,
    withCredentials: true
  };
  
  return await apiCall(method, endpoint, data, authConfig);
};
