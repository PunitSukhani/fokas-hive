import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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
  const [sessionData, setSessionData] = useState({
    loginTime: null,
    lastActivity: null,
    userPreferences: {}
  });

  // Update user session activity
  const updateActivity = useCallback(() => {
    setSessionData(prev => ({
      ...prev,
      lastActivity: new Date().toISOString()
    }));
  }, []);

  // Enhanced login function with session tracking
  const login = useCallback((userData) => {
    const now = new Date().toISOString();
    setCurrentUser(userData);
    setIsLoggedIn(true);
    setSessionData({
      loginTime: now,
      lastActivity: now,
      userPreferences: userData.preferences || {}
    });
  }, []);

  // Enhanced logout with session cleanup
  const logoutUser = useCallback(async () => {
    const result = await logout();
    if (result.success) {
      setCurrentUser(null);
      setIsLoggedIn(false);
      setSessionData({
        loginTime: null,
        lastActivity: null,
        userPreferences: {}
      });
    }
    return result;
  }, []);

  // Update user data in session
  const updateUser = useCallback((updatedUserData) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updatedUserData
    }));
    updateActivity();
  }, [updateActivity]);

  // Update user preferences
  const updatePreferences = useCallback((newPreferences) => {
    setSessionData(prev => ({
      ...prev,
      userPreferences: {
        ...prev.userPreferences,
        ...newPreferences
      }
    }));
    updateActivity();
  }, [updateActivity]);

  // Check if session is still valid
  const refreshSession = useCallback(async () => {
    try {
      const verifyResponse = await verifyToken();
      if (verifyResponse.success) {
        const userResponse = await getCurrentUser();
        if (userResponse.success) {
          setCurrentUser(userResponse);
          setIsLoggedIn(true);
          updateActivity();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
  }, [updateActivity]);

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
            const now = new Date().toISOString();
            setCurrentUser(userResponse);
            setIsLoggedIn(true);
            setSessionData(prev => ({
              ...prev,
              loginTime: prev.loginTime || now,
              lastActivity: now
            }));
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

  // Auto-update activity on user interaction
  useEffect(() => {
    if (isLoggedIn) {
      const handleActivity = () => updateActivity();
      
      // Track user activity
      window.addEventListener('click', handleActivity);
      window.addEventListener('keypress', handleActivity);
      window.addEventListener('scroll', handleActivity);
      
      return () => {
        window.removeEventListener('click', handleActivity);
        window.removeEventListener('keypress', handleActivity);
        window.removeEventListener('scroll', handleActivity);
      };
    }
  }, [isLoggedIn, updateActivity]);

  const value = {
    // User state
    currentUser,
    isLoggedIn,
    loading,
    
    // Session data
    sessionData,
    
    // Auth methods
    login,
    logout: logoutUser,
    
    // Session methods
    updateUser,
    updatePreferences,
    refreshSession,
    updateActivity,
    
    // Computed values
    isSessionActive: isLoggedIn && currentUser,
    userId: currentUser?.id,
    userName: currentUser?.name,
    userEmail: currentUser?.email
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
