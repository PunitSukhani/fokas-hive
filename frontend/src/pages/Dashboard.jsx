import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useSocket from '../hooks/useSocket';
import { useActiveRooms, useUserPresence } from '../hooks/useAbly';
import useRoomOperations from '../hooks/useRoomOperations';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SearchAndCreateBar from '../components/dashboard/SearchAndCreateBar';
import RoomList from '../components/dashboard/RoomList';
import CreateRoomModal from '../components/dashboard/CreateRoomModal';
import SessionInfo from '../components/debug/SessionInfo';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Server URL configuration - could be moved to .env file
const SOCKET_SERVER_URL = 'http://localhost:5000';

const Dashboard = () => {
  // Socket hook for compatibility with existing room operations
  const { socket, isConnected: socketConnected, connectionError, reconnect } = useSocket(SOCKET_SERVER_URL);
  
  // Ably hooks for real-time active rooms
  const { 
    activeRooms, 
    loading: ablyLoading, 
    error: ablyError, 
    isConnected: ablyConnected,
    refetch: refetchRooms
  } = useActiveRooms();
  
  // User presence for additional context
  const { userPresence } = useUserPresence();
  
  // Room operations hook (updated to work with both Socket.IO and REST API)
  const {
    searchTerm,
    filteredRooms,
    showCreateModal,
    newRoomName,
    setShowCreateModal,
    setNewRoomName,
    handleSearchChange,
    handleCreateRoom,
    handleJoinRoom,
    updateActiveRooms
  } = useRoomOperations(socket, socketConnected, activeRooms);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update loading and error states based on Ably
  useEffect(() => {
    setLoading(ablyLoading);
    setError(ablyError);
  }, [ablyLoading, ablyError]);

  // Update filtered rooms when active rooms change
  useEffect(() => {
    updateActiveRooms(activeRooms);
  }, [activeRooms, updateActiveRooms]);

  // Setup socket event listeners for room creation (fallback)
  useEffect(() => {
    if (!socket) return;

    let isMounted = true;

    const handleRoomCreated = (roomData) => {
      if (isMounted) {
        toast.success(`Room "${roomData.name || 'New Room'}" created successfully!`);
        // Refetch rooms to get updated list
        refetchRooms();
      }
    };

    // Setup socket event listeners
    socket.on('room-created', handleRoomCreated);

    // Cleanup function
    return () => {
      isMounted = false;
      socket.off('room-created', handleRoomCreated);
    };
  }, [socket, refetchRooms]);

  // Handle connection errors and initial loading state
  useEffect(() => {
    if (connectionError && !ablyConnected) {
      console.error('Both Socket.IO and Ably connection failed:', connectionError);
      setError('Failed to connect to server. Please try again later.');
      setLoading(false);
    } else if (ablyConnected || socketConnected) {
      // If either connection is working, clear errors
      setError(null);
    }
  }, [connectionError, ablyConnected, socketConnected]);

  // Function to retry connection
  const retryConnection = () => {
    console.log('Retrying connections...');
    setLoading(true);
    setError(null);
    
    toast.info('Reconnecting to server...', { 
      toastId: 'reconnecting',
      autoClose: 2000
    });
    
    reconnect(); // Retry Socket.IO
    refetchRooms(); // Retry Ably/REST
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <DashboardHeader />
          
          {/* Connection Status Indicator */}
          <div className="mb-4 flex gap-2 text-sm">
            <div className={`px-2 py-1 rounded text-xs ${
              ablyConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              Ably: {ablyConnected ? 'Connected' : 'Disconnected'}
            </div>
            <div className={`px-2 py-1 rounded text-xs ${
              socketConnected ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              Socket.IO: {socketConnected ? 'Connected' : 'Fallback'}
            </div>
          </div>

          <SearchAndCreateBar 
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onCreateRoom={() => setShowCreateModal(true)}
            isConnected={ablyConnected || socketConnected}
          />
          
          <div className="mt-8">
            <RoomList 
              loading={loading}
              error={error}
              rooms={filteredRooms}
              onJoinRoom={handleJoinRoom}
              onCreateRoom={() => setShowCreateModal(true)}
              onRetryConnection={retryConnection}
              userPresence={userPresence}
            />
          </div>
          
          {/* Session Debug Info - Remove in production */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-8">
              <SessionInfo />
            </div>
          )}
        </div>
        
        <CreateRoomModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRoom}
          roomName={newRoomName}
          onRoomNameChange={(e) => setNewRoomName(e.target.value)}
          isConnected={ablyConnected || socketConnected}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;