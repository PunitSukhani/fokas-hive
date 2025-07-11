import React from 'react';

const Message = ({ message, isHost, isCurrentUser, className = "" }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // System messages (user join/leave notifications)
  if (message.type === 'system') {
    return (
      <div className={`flex justify-center mb-3 ${className}`}>
        <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
          {message.message}
        </div>
      </div>
    );
  }

  // User messages
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 ${className}`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isCurrentUser ? 'order-2' : 'order-1'}`}>
        {/* Message header with name and time */}
        <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
          <div className="flex items-center gap-1">
            {isHost && (
              <span className="text-yellow-500 text-sm" title="Host">👑</span>
            )}
            <span className="text-sm font-medium text-gray-700">
              {isCurrentUser ? 'You' : message.name}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>
        </div>
        
        {/* Message bubble */}
        <div className={`px-4 py-2 rounded-2xl ${
          isCurrentUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message}
          </p>
        </div>
      </div>
      
      {/* Avatar */}
      <div className={`flex-shrink-0 ${isCurrentUser ? 'order-1 mr-3' : 'order-2 ml-3'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
          isCurrentUser ? 'bg-blue-600' : 'bg-gray-500'
        }`}>
          {message.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    </div>
  );
};

export default Message;
