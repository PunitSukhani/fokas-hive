import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Session Info Component - Shows current authentication and session state
 * For development debugging only
 */
const SessionInfo = () => {
  const { currentUser, isLoggedIn, sessionData } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Session Debug</h3>
        <p className="text-gray-600">Not authenticated</p>
      </div>
    );
  }

  const formatDuration = (startTime) => {
    if (!startTime) return 'Unknown';
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatLastActivity = (lastActivity) => {
    if (!lastActivity) return 'Unknown';
    const last = new Date(lastActivity);
    const now = new Date();
    const diffMs = now - last;
    const minutes = Math.floor(diffMs / (1000 * 60));
    if (minutes < 1) return 'Just now';
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Session Debug Info</h3>
      
      {/* User Info */}
      <div className="space-y-2">
        <p><span className="font-medium">User:</span> {currentUser?.name}</p>
        <p><span className="font-medium">Email:</span> {currentUser?.email}</p>
        <p><span className="font-medium">User ID:</span> {currentUser?.id}</p>
      </div>

      {/* Session Stats */}
      <div className="space-y-2">
        <p><span className="font-medium">Session Duration:</span> {formatDuration(sessionData?.loginTime)}</p>
        <p><span className="font-medium">Last Activity:</span> {formatLastActivity(sessionData?.lastActivity)}</p>
        <p><span className="font-medium">Login Time:</span> {sessionData?.loginTime ? new Date(sessionData.loginTime).toLocaleString() : 'Unknown'}</p>
      </div>

      {/* Authentication Status */}
      <div className="space-y-2">
        <p><span className="font-medium">Authenticated:</span> 
          <span className={`ml-2 px-2 py-1 rounded text-xs ${isLoggedIn ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isLoggedIn ? 'Yes' : 'No'}
          </span>
        </p>
      </div>

      {/* User Preferences */}
      {sessionData?.userPreferences && Object.keys(sessionData.userPreferences).length > 0 && (
        <div className="space-y-2">
          <p className="font-medium">Preferences:</p>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(sessionData.userPreferences, null, 2)}
          </pre>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
        <button
          onClick={() => console.log('Session Data:', { currentUser, sessionData })}
          className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
        >
          Log to Console
        </button>
      </div>
    </div>
  );
};

export default SessionInfo;
