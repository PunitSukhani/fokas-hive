import axios from "axios";
import { BASE_URL } from "./apiPaths";

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
    // Standardize successful responses
    return { success: true, ...response.data };
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
        
        // Return standardized error format instead of rejecting
        return {
          success: false,
          error: errorMessage === 'Invalid credentials' ? 
            'Incorrect email or password' : 
            errorMessage
        };
      } else if (error.response.status === 500) {
        console.error("Server error. Please try again later.");
        return {
          success: false,
          error: 'Server error. Please try again later.'
        };
      }
      
      // For other status codes, return standardized error
      return {
        success: false,
        error: errorMessage
      };
    }
    
    // Network error or other issues
    console.error("Network or request error:", error.message);
    return {
      success: false,
      error: error.message || 'Network connection error'
    };
  }
);

export default axiosInstance;
