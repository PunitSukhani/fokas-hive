import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

const useChat = (socket, roomId, isConnected = false) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSystemMessages, setRecentSystemMessages] = useState(new Set());

  // Add a system message (for user join/leave notifications)
  const addSystemMessage = useCallback((message) => {
    // Prevent duplicate system messages within 2 seconds
    const messageKey = `${message}-${Math.floor(Date.now() / 2000)}`;
    
    if (recentSystemMessages.has(messageKey)) {
      console.log('Duplicate system message prevented:', message);
      return;
    }
    
    setRecentSystemMessages(prev => {
      const newSet = new Set(prev);
      newSet.add(messageKey);
      // Clean up old entries (keep only last 10)
      if (newSet.size > 10) {
        const entries = Array.from(newSet);
        newSet.clear();
        entries.slice(-5).forEach(entry => newSet.add(entry));
      }
      return newSet;
    });
    
    const systemMessage = {
      id: `system-${Date.now()}`,
      type: 'system',
      message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, systemMessage]);
  }, [recentSystemMessages]);

  // Send a message
  const sendMessage = useCallback(async (message) => {
    if (!socket || !isConnected || !roomId) {
      throw new Error('Not connected to chat');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Message send timeout'));
      }, 5000);

      // Listen for error response
      const handleError = (error) => {
        clearTimeout(timeout);
        socket.off('error', handleError);
        reject(new Error(error.message || 'Failed to send message'));
      };

      socket.once('error', handleError);

      // Send the message
      socket.emit('send-message', { roomId, message });

      // Resolve immediately since we'll receive the message via broadcast
      clearTimeout(timeout);
      socket.off('error', handleError);
      resolve();
    });
  }, [socket, roomId, isConnected]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (messageData) => {
      console.log('New message received:', messageData);
      
      // Ensure message has required fields
      const formattedMessage = {
        id: messageData.id || `${messageData.timestamp}-${messageData.userId}`,
        userId: messageData.userId,
        name: messageData.name,
        message: messageData.message,
        timestamp: messageData.timestamp,
        type: messageData.type || 'user'
      };
      
      setMessages(prev => [...prev, formattedMessage]);
    };

    const handleUserJoined = (userData) => {
      console.log('User joined chat:', userData);
      const userName = userData.name || userData.userName || 'Unknown User';
      addSystemMessage(`${userName} joined the room`);
    };

    const handleUserLeft = (userData) => {
      console.log('User left chat:', userData);
      const userName = userData.name || userData.userName || 'Unknown User';
      addSystemMessage(`${userName} left the room`);
    };

    const handleError = (error) => {
      console.error('Chat error:', error);
      toast.error(error.message || 'Chat error occurred', { 
        toastId: 'chat-error' 
      });
    };

    // Register event listeners
    socket.on('new-message', handleNewMessage);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('error', handleError);

    // Cleanup
    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('error', handleError);
    };
  }, [socket, isConnected, addSystemMessage]);

  // Clear messages when room changes
  useEffect(() => {
    if (roomId) {
      setMessages([]);
      setRecentSystemMessages(new Set());
      setLoading(false);
    }
  }, [roomId]);

  return {
    messages,
    loading,
    sendMessage,
    addSystemMessage
  };
};

export default useChat;
