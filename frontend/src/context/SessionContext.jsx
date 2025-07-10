import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Session Context for managing client-side session data
const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionData, setSessionData] = useState({
    isActive: false,
    startTime: null,
    lastActivity: null,
    preferences: {},
    connections: {
      ably: false,
      socket: false
    }
  });

  // Initialize session
  const initializeSession = useCallback((userInfo = {}) => {
    const now = new Date().toISOString();
    setSessionData(prev => ({
      ...prev,
      isActive: true,
      startTime: now,
      lastActivity: now,
      preferences: { ...prev.preferences, ...userInfo.preferences }
    }));
  }, []);

  // Update session activity
  const updateActivity = useCallback(() => {
    setSessionData(prev => ({
      ...prev,
      lastActivity: new Date().toISOString()
    }));
  }, []);

  // Update connection status
  const updateConnectionStatus = useCallback((type, status) => {
    setSessionData(prev => ({
      ...prev,
      connections: {
        ...prev.connections,
        [type]: status
      }
    }));
  }, []);

  // Update preferences
  const updatePreferences = useCallback((newPreferences) => {
    setSessionData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...newPreferences }
    }));
  }, []);

  // Clear session
  const clearSession = useCallback(() => {
    setSessionData({
      isActive: false,
      startTime: null,
      lastActivity: null,
      preferences: {},
      connections: {
        ably: false,
        socket: false
      }
    });
  }, []);

  // Auto-track activity when user interacts with the page
  useEffect(() => {
    if (sessionData.isActive) {
      const handleActivity = () => updateActivity();
      
      // Add event listeners for user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, handleActivity, { passive: true });
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleActivity);
        });
      };
    }
  }, [sessionData.isActive, updateActivity]);

  // Calculate session duration
  const getSessionDuration = useCallback(() => {
    if (!sessionData.startTime) return 0;
    return Date.now() - new Date(sessionData.startTime).getTime();
  }, [sessionData.startTime]);

  // Check if session is stale
  const isSessionStale = useCallback((maxInactiveTime = 30 * 60 * 1000) => { // 30 minutes default
    if (!sessionData.lastActivity) return false;
    return Date.now() - new Date(sessionData.lastActivity).getTime() > maxInactiveTime;
  }, [sessionData.lastActivity]);

  const value = {
    sessionData,
    initializeSession,
    updateActivity,
    updateConnectionStatus,
    updatePreferences,
    clearSession,
    getSessionDuration,
    isSessionStale
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

// Custom hook to use session context
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export default SessionContext;
