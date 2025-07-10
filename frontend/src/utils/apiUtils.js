import axiosInstance from "./axiosInstance";
import API_PATHS from "./apiPaths";

/**
 * Generic API call function
 * @param {string} method - HTTP method (get, post, put, delete)
 * @param {string} url - API endpoint
 * @param {Object} data - Request body data
 * @param {Object} config - Additional axios config
 * @returns {Promise} Promise with response
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
