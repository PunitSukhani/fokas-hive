import { useAuth } from '../context/AuthContext';
import { useCallback, useMemo } from 'react';

/**
 * Custom hook for session management
 * Provides easy access to user session data and utilities
 */
export const useSession = () => {
  const {
    currentUser,
    isLoggedIn,
    loading,
    sessionData,
    login,
    logout,
    updateUser,
    updatePreferences,
    refreshSession,
    updateActivity,
    isSessionActive,
    userId,
    userName,
    userEmail
  } = useAuth();

  // Session duration calculation
  const sessionDuration = useMemo(() => {
    if (!sessionData.loginTime) return null;
    
    const loginTime = new Date(sessionData.loginTime);
    const now = new Date();
    const diffMs = now - loginTime;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes, totalMinutes: Math.floor(diffMs / (1000 * 60)) };
  }, [sessionData.loginTime]);

  // Time since last activity
  const timeSinceActivity = useMemo(() => {
    if (!sessionData.lastActivity) return null;
    
    const lastActivity = new Date(sessionData.lastActivity);
    const now = new Date();
    const diffMs = now - lastActivity;
    
    return Math.floor(diffMs / (1000 * 60)); // minutes
  }, [sessionData.lastActivity]);

  // Check if user has specific permissions (can be extended based on your needs)
  const hasPermission = useCallback((permission) => {
    if (!currentUser) return false;
    // Add your permission logic here
    return currentUser.permissions?.includes(permission) || false;
  }, [currentUser]);

  // Get user preference
  const getPreference = useCallback((key, defaultValue = null) => {
    return sessionData.userPreferences?.[key] ?? defaultValue;
  }, [sessionData.userPreferences]);

  // Set user preference
  const setPreference = useCallback((key, value) => {
    updatePreferences({ [key]: value });
  }, [updatePreferences]);

  // Session utilities
  const sessionUtils = useMemo(() => ({
    // Quick access to user data
    user: currentUser,
    isActive: isSessionActive,
    
    // User identifiers
    id: userId,
    name: userName,
    email: userEmail,
    
    // Session timing
    duration: sessionDuration,
    lastActivity: timeSinceActivity,
    
    // Session state
    isNewSession: sessionDuration?.totalMinutes < 5,
    isLongSession: sessionDuration?.totalMinutes > 60,
    
    // Authentication utilities
    isAuthenticated: isLoggedIn && !loading,
    isGuest: !isLoggedIn && !loading,
    
    // Helper methods
    hasPermission,
    getPreference,
    setPreference,
    refresh: refreshSession,
    touch: updateActivity // Mark activity
  }), [
    currentUser,
    isSessionActive,
    userId,
    userName,
    userEmail,
    sessionDuration,
    timeSinceActivity,
    isLoggedIn,
    loading,
    hasPermission,
    getPreference,
    setPreference,
    refreshSession,
    updateActivity
  ]);

  return {
    // Core auth state
    loading,
    isLoggedIn,
    currentUser,
    sessionData,
    
    // Auth methods
    login,
    logout,
    updateUser,
    
    // Session utilities
    ...sessionUtils
  };
};

export default useSession;
