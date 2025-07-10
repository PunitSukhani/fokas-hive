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
    console.log('Attempting login for:', email);
    const result = await axiosInstance.post(API_PATHS.AUTH.LOGIN, { email, password });
    
    console.log('Login response:', result);
    
    // The backend sets the cookie automatically
    // Check if we have user data in the response
    // The axiosInstance likely returns the data directly, so check both result.user and result.data.user
    const user = result.user || result.data?.user || result.data;
    
    if (user && (user.id || user._id)) {
      return { 
        success: true, 
        user: user
      };
    }
    
    // If we don't have user data, something went wrong
    return { 
      success: false, 
      error: 'Login response invalid - no user data received' 
    };
  } catch (error) {
    console.error('Login error:', error);
    
    // Return user-friendly error message
    // If the error has been processed by axiosInstance interceptor
    if (error.response) {
      return { 
        success: false, 
        error: error.response.data?.message || error.message || 'Login failed'
      };
    }
    
    return { 
      success: false, 
      error: error.message || 'Invalid login credentials. Please check your email and password.' 
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
    const userData = await apiCall('get', API_PATHS.AUTH.GET_PROFILE);
    
    // Handle different response formats
    if (userData && (userData.id || userData._id)) {
      return { success: true, ...userData };
    }
    
    return { success: false, error: 'No user data received' };
  } catch (error) {
    console.error('Get user profile error:', error);
    return { success: false, error: error.message || 'Failed to get user profile' };
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
    const userData = await apiCall('get', API_PATHS.AUTH.VERIFY);
    
    if (userData && (userData.id || userData._id)) {
      return { success: true, user: userData };
    }
    
    return { success: false, error: 'Token verification failed' };
  } catch (error) {
    console.error('Token verification error:', error);
    return { success: false, error: error.message || 'Token verification failed' };
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
