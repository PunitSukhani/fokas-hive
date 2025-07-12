import axiosInstance from "./axiosInstance";
import API_PATHS from "./apiPaths";

/**
 * API Utility Functions
 * 
 * Provides centralized API calling functionality with:
 * - Automatic authentication via cookies
 * - Consistent error handling
 * - Support for all HTTP methods
 * - Credential management
 * 
 * All API calls automatically include credentials for authentication
 * and use the configured axios instance with interceptors.
 */

/**
 * Generic API call function with automatic credential handling
 * @param {string} method - HTTP method (get, post, put, delete)
 * @param {string} url - API endpoint URL or path
 * @param {Object} data - Request body data for POST/PUT requests
 * @param {Object} config - Additional axios configuration options
 * @returns {Promise} Promise resolving to response data
 * @throws {Error} If request fails or returns error status
 */
export const apiCall = async (method, url, data = null, config = {}) => {
  try {
    // Ensure withCredentials is always true to include cookies
    const configWithCredentials = {
      ...config,
      withCredentials: true
    };
    
    let response;
    
    switch (method.toLowerCase()) {
      case 'get':
        response = await axiosInstance.get(url, configWithCredentials);
        break;
      case 'post':
        response = await axiosInstance.post(url, data, configWithCredentials);
        break;
      case 'put':
        response = await axiosInstance.put(url, data, configWithCredentials);
        break;
      case 'delete':
        response = await axiosInstance.delete(url, configWithCredentials);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    
    // For successful responses, return the data with success flag
    return { success: true, ...response };
  } catch (error) {
    console.error(`API error (${method.toUpperCase()} ${url}):`, error);
    
    // Standardize error response
    if (error.response) {
      throw error; // Re-throw to be handled by calling function
    }
    
    throw error; // Re-throw to be handled by calling function
  }
};
