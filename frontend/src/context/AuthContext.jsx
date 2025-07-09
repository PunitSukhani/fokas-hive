import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  isAuthenticated,
  getCurrentUser,
  logout,
  verifyToken
} from '../services/authService';

// Create the authentication context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check authentication status when the app loads
    const checkAuth = async () => {
      try {
        // Verify token validity with backend
        const verifyResponse = await verifyToken();
        
        if (verifyResponse.success) {
          // If token is valid, fetch user profile
          const userResponse = await getCurrentUser();
          if (userResponse.success) {
            setCurrentUser(userResponse);
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            setCurrentUser(null);
          }
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsLoggedIn(false);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = (userData) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);
  };

  const logoutUser = async () => {
    const result = await logout();
    if (result.success) {
      setCurrentUser(null);
      setIsLoggedIn(false);
    }
  };

  const value = {
    currentUser,
    isLoggedIn,
    loading,
    login,
    logout: logoutUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
