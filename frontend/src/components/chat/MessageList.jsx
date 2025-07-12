import React, { useEffect, useRef } from 'react';
import Message from './Message';

/**
 * Message List Component
 * 
 * Scrollable container for displaying chat messages with auto-scroll behavior.
 * Automatically scrolls to bottom when new messages arrive.
 * Shows loading state and empty state when appropriate.
 * 
 * @param {Array} messages - Array of message objects to display
 * @param {string} currentUserId - ID of current user for message styling
 * @param {string} hostId - ID of room host for special styling
 * @param {boolean} loading - Whether messages are being loaded
 * @param {string} className - Additional CSS classes
 * @returns {JSX.Element} Scrollable message list
 */
const MessageList = ({ 
  messages = [], 
  currentUserId, 
  hostId, 
  loading = false,
  className = "" 
}) => {
  const containerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (containerRef.current) {
        // Scroll only within the chat container, not the entire page
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    };

    // Small delay to ensure DOM is updated
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  if (loading) {
    return (
      <div className={`flex-1 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={`flex-1 flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No messages yet</h3>
          <p className="text-sm text-gray-500">Be the first to start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`flex-1 overflow-y-auto p-4 space-y-1 ${className}`}
    >
      {messages.map((message) => {
        const isCurrentUser = message.userId === currentUserId;
        const isHost = message.userId === hostId;
        
        return (
          <Message
            key={message.id || `${message.timestamp}-${message.userId}`}
            message={message}
            isHost={isHost}
            isCurrentUser={isCurrentUser}
          />
        );
      })}
    </div>
  );
};

export default MessageList;
