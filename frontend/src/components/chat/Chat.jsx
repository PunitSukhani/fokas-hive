import React from 'react';
import { HiChat } from 'react-icons/hi';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

/**
 * Chat Component
 * 
 * Main chat interface combining message list and input components.
 * Displays real-time messages between room members with connection status.
 * 
 * @param {Array} messages - Array of chat messages
 * @param {Function} onSendMessage - Function to send a new message
 * @param {string} currentUserId - ID of the current user
 * @param {string} hostId - ID of the room host
 * @param {boolean} isConnected - Socket connection status
 * @param {boolean} loading - Whether messages are loading
 * @param {string} className - Additional CSS classes
 * @param {boolean} showHeader - Whether to show chat header
 * @returns {JSX.Element} Complete chat interface
 */
const Chat = ({ 
  messages = [], 
  onSendMessage, 
  currentUserId, 
  hostId,
  isConnected = false,
  loading = false,
  className = "",
  showHeader = true 
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
    <div className={`bg-white rounded-xl shadow-sm border border-gray-50 flex flex-col ${
      className.includes('h-full') ? 'h-full' : 'h-[600px]'
    } ${className}`}>
      {/* Chat Header - Optional */}
      {showHeader && (
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
      )}

      {/* Messages Area - Optimized Height */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        hostId={hostId}
        loading={loading}
        className="flex-1 min-h-0"
      />

      {/* Message Input - Fixed at Bottom */}
      <div className="border-t border-gray-200">
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
    </div>
  );
};

export default Chat;
