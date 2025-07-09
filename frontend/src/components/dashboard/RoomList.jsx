import React from 'react';
import { HiOutlineUsers, HiPlus } from 'react-icons/hi';

const RoomList = ({ 
  loading, 
  error, 
  rooms, 
  onJoinRoom, 
  onCreateRoom, 
  onRetryConnection 
}) => {
  // Avatar display helper
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map(room => (
        <div 
          key={room.id || room._id} 
          onClick={() => onJoinRoom(room.id || room._id)}
          className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-50 p-6 cursor-pointer transition-all"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg text-slate-800 truncate">{room.name}</h3>
            <div className="flex items-center text-slate-500">
              <HiOutlineUsers size={18} />
              <span className="ml-1">{room.userCount || room.users?.length || 0}</span>
            </div>
          </div>
          
          {/* User avatars */}
          {room.users && room.users.length > 0 && (
            <div className="flex -space-x-2 overflow-hidden">
              {room.users.slice(0, 3).map(user => (
                <div 
                  key={user.id || user._id} 
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-blue-500 text-white flex items-center justify-center text-xs font-semibold"
                >
                  {getInitials(user.name || 'User')}
                </div>
              ))}
              {room.users.length > 3 && (
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 text-slate-600 flex items-center justify-center text-xs font-semibold">
                  +{room.users.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RoomList;
