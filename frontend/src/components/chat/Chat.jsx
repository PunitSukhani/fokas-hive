import React from 'react';
import { HiChat } from 'react-icons/hi';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const Chat = ({ 
  messages = [], 
  onSendMessage, 
  currentUserId, 
  hostId,
  isConnected = false,
  loading = false,
  className = "" 
}) => {
  const handleSendMessage = async (message) => {
    if (!isConnected) {
      throw new Error('Not connected to chat');
    }
    
    if (typeof onSendMessage === 'function') {
      await onSendMessage(message);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-50 flex flex-col h-96 ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <HiChat className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-800">Chat</h2>
        
        {/* Connection status */}
        <div className="ml-auto flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-xs text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        hostId={hostId}
        loading={loading}
        className="flex-1"
      />

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={!isConnected}
        placeholder={
          isConnected 
            ? "Type a message..." 
            : "Connecting to chat..."
        }
      />
    </div>
  );
};

export default Chat;
