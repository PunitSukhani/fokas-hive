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
    GET_ACTIVE: "/rooms/active",
    GET_ONE: (id) => `/rooms/${id}`,
    JOIN: (id) => `/rooms/${id}/join`,
  },
};

export default API_PATHS;
