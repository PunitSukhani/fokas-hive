import React from 'react';
import { HiOutlineUsers, HiPlus, HiClock, HiUser } from 'react-icons/hi';

const RoomList = ({ 
  loading, 
  error, 
  rooms, 
  onJoinRoom, 
  onCreateRoom, 
  onRetryConnection,
  userPresence = {} 
}) => {
  // Avatar display helper
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Avatar color helper
  const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-500';
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Format timestamp helper
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString() === new Date().toLocaleDateString() 
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 p-10 rounded-lg shadow-sm text-center">
        <p className="text-red-600 text-lg mb-4">Unable to connect to server</p>
        <button
          onClick={onRetryConnection}
          className="bg-red-100 text-red-700 px-6 py-2 rounded hover:bg-red-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="bg-white border border-gray-100 p-10 rounded-lg shadow-sm text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
            <HiOutlineUsers className="w-10 h-10 text-blue-300" />
          </div>
        </div>
        <h3 className="text-slate-800 text-xl font-medium mb-2">No Study Rooms Available</h3>
        <p className="text-slate-500 mb-6">There are currently no active study rooms. Be the first to create one!</p>
        <button
          onClick={onCreateRoom}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <HiPlus size={20} />
          <span>Create a Room</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Rooms Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Active Study Rooms</h2>
          <p className="text-slate-500">{rooms.length} room{rooms.length !== 1 ? 's' : ''} currently active</p>
        </div>
        <div className="text-sm text-slate-400 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live updates
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <div 
            key={room.id || room._id} 
            onClick={() => onJoinRoom(room.id || room._id)}
            className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-50 p-6 cursor-pointer transition-all hover:scale-105 group"
          >
            {/* Room Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                  {room.name}
                </h3>
                {room.host && (
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <HiUser size={14} />
                    Host: {room.host.name}
                  </p>
                )}
              </div>
              <div className="flex items-center text-slate-500 bg-slate-50 rounded-full px-3 py-1">
                <HiOutlineUsers size={16} />
                <span className="ml-1 font-medium">{room.userCount || room.users?.length || 0}</span>
              </div>
            </div>
            
            {/* User Avatars */}
            {room.users && room.users.length > 0 && (
              <div className="mb-4">
                <div className="flex -space-x-2 overflow-hidden mb-2">
                  {room.users.slice(0, 4).map((user, index) => (
                    <div 
                      key={`${room.id || room._id}-user-${user.id || user._id || index}`} 
                      className={`inline-block h-8 w-8 rounded-full ring-2 ring-white ${getAvatarColor(user.name)} text-white flex items-center justify-center text-xs font-semibold transition-transform hover:scale-110`}
                      title={user.name || 'User'}
                    >
                      {getInitials(user.name || 'User')}
                    </div>
                  ))}
                  {room.users.length > 4 && (
                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 text-slate-600 flex items-center justify-center text-xs font-semibold">
                      +{room.users.length - 4}
                    </div>
                  )}
                </div>
                
                {/* User Names Preview */}
                <div className="text-sm text-slate-500">
                  {room.users.slice(0, 2).map(user => user.name).join(', ')}
                  {room.users.length > 2 && ` and ${room.users.length - 2} other${room.users.length > 3 ? 's' : ''}`}
                </div>
              </div>
            )}

            {/* Timer State */}
            {room.timerState && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <HiClock size={16} className="text-slate-500" />
                    <span className="text-slate-600 capitalize">
                      {room.timerState.mode === 'focus' ? 'Focus Session' : 
                       room.timerState.mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                    </span>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    room.timerState.isRunning 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {room.timerState.isRunning ? 'Running' : 'Paused'}
                  </div>
                </div>
              </div>
            )}

            {/* Custom Timer Settings */}
            {room.timerSettings && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-700 font-medium mb-1">Timer Settings</div>
                <div className="text-xs text-blue-600 space-x-3">
                  <span>Focus: {Math.round(room.timerSettings.focusDuration / 60)}m</span>
                  <span>Short: {Math.round(room.timerSettings.shortBreakDuration / 60)}m</span>
                  <span>Long: {Math.round(room.timerSettings.longBreakDuration / 60)}m</span>
                </div>
              </div>
            )}

            {/* Room Stats */}
            <div className="flex justify-between items-center text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <HiClock size={14} />
                Created {formatTime(room.createdAt)}
              </div>
              <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                Join Room
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      {Object.keys(userPresence).length > 0 && (
        <div className="mt-8 bg-white rounded-lg border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {Object.values(userPresence).slice(0, 3).map((presence, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className={`w-2 h-2 rounded-full ${presence.status === 'joined' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-slate-600">
                  <strong>{presence.userName}</strong> {presence.status} <strong>{presence.roomName}</strong>
                </span>
                <span className="text-slate-400 ml-auto">
                  {formatTime(presence.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;
