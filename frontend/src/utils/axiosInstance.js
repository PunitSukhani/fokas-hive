import axios from "axios";
import { BASE_URL } from "./apiPaths";

/**
 * Configured Axios Instance
 * 
 * Pre-configured axios instance for the FokasHive application with:
 * - Base URL configuration
 * - Request/response timeouts
 * - Automatic credential inclusion
 * - Global error handling
 * - Authentication redirects
 * 
 * Features:
 * - Automatic cookie-based authentication
 * - Response data extraction
 * - 401 redirect to login page
 * - Global error message handling
 * - Timeout configuration (10 seconds)
 */

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true // Always include cookies for authentication
});

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Return the data directly for successful responses
    return response.data;
  },
  (error) => {
    // Handle common errors globally
    if (error.response) {
      // Get meaningful error message from response
      const errorMessage = error.response.data?.message || 
        error.response.statusText || 
        'An error occurred';
      
      if (error.response.status === 401) {
        // Unauthorized - for login page show message, for other pages redirect
        const currentPath = window.location.pathname;
        if (!['/login', '/register', '/'].includes(currentPath)) {
          window.location.href = "/login";
        }
      } else if (error.response.status === 500) {
        console.error("Server error. Please try again later.");
      }
      
      // Reject with standardized error
      return Promise.reject({
        message: errorMessage,
        status: error.response.status,
        response: error.response
      });
    }
    
    // Network error or other issues
    console.error("Network or request error:", error.message);
    return Promise.reject({
      message: error.message || 'Network connection error',
      status: null,
      response: null
    });
  }
);

export default axiosInstance;
