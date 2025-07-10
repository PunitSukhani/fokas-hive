import React from 'react';
import { useSession } from '../hooks/useSession';

/**
 * Example component showing different ways to use the session provider
 */

// 1. Simple user info display
export const UserGreeting = () => {
  const { name, isAuthenticated } = useSession();
  
  if (!isAuthenticated) return null;
  
  return <h2>Welcome back, {name}!</h2>;
};

// 2. Conditional rendering based on session state
export const AuthenticatedContent = ({ children }) => {
  const { isAuthenticated, loading } = useSession();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in to continue</div>;
  
  return children;
};

// 3. User avatar with session info
export const UserAvatar = () => {
  const { user, duration, getPreference } = useSession();
  
  const theme = getPreference('theme', 'light');
  
  return (
    <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
      <img 
        src={user?.avatar || '/default-avatar.png'} 
        alt={user?.name}
        className="w-8 h-8 rounded-full"
        title={`Online for ${duration?.hours}h ${duration?.minutes}m`}
      />
    </div>
  );
};

// 4. Session activity tracker
export const ActivityTracker = () => {
  const { lastActivity, touch, isLongSession } = useSession();
  
  return (
    <div className="text-sm text-gray-500">
      {isLongSession && (
        <div className="text-orange-500">
          You've been active for a while! Consider taking a break.
        </div>
      )}
      <div>Last activity: {lastActivity} minutes ago</div>
      <button 
        onClick={touch}
        className="text-blue-500 underline"
      >
        I'm still here!
      </button>
    </div>
  );
};

// 5. Protected action button
export const CreateRoomButton = ({ onClick }) => {
  const { isAuthenticated, hasPermission } = useSession();
  
  if (!isAuthenticated || !hasPermission('create_room')) {
    return (
      <button disabled className="px-4 py-2 bg-gray-300 text-gray-500 rounded">
        Login to Create Room
      </button>
    );
  }
  
  return (
    <button 
      onClick={onClick}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Create New Room
    </button>
  );
};

// 6. User preferences panel
export const PreferencesPanel = () => {
  const { getPreference, setPreference } = useSession();
  
  const theme = getPreference('theme', 'light');
  const notifications = getPreference('notifications', true);
  
  return (
    <div className="space-y-2">
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={theme === 'dark'}
          onChange={(e) => setPreference('theme', e.target.checked ? 'dark' : 'light')}
        />
        Dark Mode
      </label>
      
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={notifications}
          onChange={(e) => setPreference('notifications', e.target.checked)}
        />
        Enable Notifications
      </label>
    </div>
  );
};

// 7. Session status indicator
export const SessionStatus = () => {
  const { isActive, duration, lastActivity } = useSession();
  
  const getStatusColor = () => {
    if (!isActive) return 'bg-red-500';
    if (lastActivity < 5) return 'bg-green-500';
    if (lastActivity < 15) return 'bg-yellow-500';
    return 'bg-orange-500';
  };
  
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
      <span className="text-sm">
        {isActive ? `Active ${duration?.hours}h ${duration?.minutes}m` : 'Offline'}
      </span>
    </div>
  );
};
