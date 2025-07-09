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
      if (error.response.status === 401) {
        // Unauthorized, redirect to login page
        // Only redirect if not already on login page or register page
        const currentPath = window.location.pathname;
        if (!['/login', '/register', '/'].includes(currentPath)) {
          window.location.href = "/login";
        }
      } else if (error.response.status === 500) {
        console.error("Server error. Please try again later.");
      }
      
      return Promise.reject(error);
    }
    
    // Network error or other issues
    console.error("Network or request error:", error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
