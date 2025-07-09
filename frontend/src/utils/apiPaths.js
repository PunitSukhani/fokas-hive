export const BASE_URL = "http://localhost:5000/api";

const API_PATHS = {
  AUTH: {
    REGISTER: "/auth/signup",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    VERIFY: "/auth/me", // This endpoint can be used to verify tokens
    GET_PROFILE: "/auth/me",
  },

  USER: {
    UPDATE_PROFILE: "/users/profile", 
    CHANGE_PASSWORD: "/users/password",
    GET_STATISTICS: "/users/statistics",
  },

  ROOMS: {
    CREATE: "/rooms", 
    GET_ALL: "/rooms", 
    GET_ONE: (id) => `/rooms/${id}`,
    JOIN: (id) => `/rooms/${id}/join`,
  },

  // These are placeholder paths that might be implemented in the future
  // based on the project's evolution
  MATERIALS: {
    // To be implemented when material management features are added
  },
  
  MESSAGES: {
    // For future chat functionality within rooms
  }
};

export default API_PATHS;
