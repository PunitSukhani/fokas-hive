import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useSocket from '../hooks/useSocket';
import useRoomOperations from '../hooks/useRoomOperations';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SearchAndCreateBar from '../components/dashboard/SearchAndCreateBar';
import RoomList from '../components/dashboard/RoomList';
import CreateRoomModal from '../components/dashboard/CreateRoomModal';

// Server URL configuration - could be moved to .env file
const SOCKET_SERVER_URL = 'http://localhost:5000';

const Dashboard = () => {
  // Custom socket hook
  const { socket, isConnected, connectionError, reconnect } = useSocket(SOCKET_SERVER_URL);
  
  // Room operations hook
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
  } = useRoomOperations(socket, isConnected);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket) return;

    let isMounted = true;
    let loadingTimeout;

    const handleActiveRooms = (rooms) => {
      if (isMounted) {
        console.log('Received active rooms:', rooms);
        updateActiveRooms(rooms);
        setLoading(false);
        setError(null);
      }
    };

    const handleRoomCreated = (roomData) => {
      if (isMounted) {
        toast.success(`Room "${roomData.name || 'New Room'}" created successfully!`);
        // Don't navigate here - let the backend handle the redirect
      }
    };

    // Request active rooms when connected
    if (isConnected) {
      console.log('Socket connected, requesting active rooms...');
      socket.emit('get-active-rooms');
      
      // Set a timeout to handle the case where server doesn't respond
      loadingTimeout = setTimeout(() => {
        if (isMounted) {
          console.log('Timeout reached, assuming no rooms available');
          setLoading(false);
          updateActiveRooms([]); // Set empty array instead of error
          setError(null); // Clear any potential error
        }
      }, 3000); // Reduced timeout to 3 seconds
    }

    // Setup socket event listeners
    socket.on('active-rooms', handleActiveRooms);
    socket.on('room-created', handleRoomCreated);

    // Cleanup function
    return () => {
      isMounted = false;
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      socket.off('active-rooms', handleActiveRooms);
      socket.off('room-created', handleRoomCreated);
    };
  }, [socket, isConnected, updateActiveRooms]);

  // Handle connection errors and initial loading state
  useEffect(() => {
    if (connectionError) {
      console.error('Connection error:', connectionError);
      setError('Failed to connect to server. Please try again later.');
      setLoading(false);
    } else if (isConnected && loading) {
      // If we're connected but still loading, wait a bit then stop loading
      // This handles the case where the server is connected but no rooms response
      const initialLoadTimeout = setTimeout(() => {
        console.log('Connected but no rooms response, stopping loading...');
        setLoading(false);
        updateActiveRooms([]);
      }, 1000);
      
      return () => clearTimeout(initialLoadTimeout);
    }
  }, [isConnected, connectionError, loading, updateActiveRooms]);

  // Function to retry connection
  const retryConnection = () => {
    setLoading(true);
    setError(null);
    
    toast.info('Reconnecting to server...', { 
      toastId: 'reconnecting',
      autoClose: 2000
    });
    
    reconnect();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <DashboardHeader />
        
        <SearchAndCreateBar 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onCreateRoom={() => setShowCreateModal(true)}
          isConnected={isConnected}
        />
        
        <div className="mt-8">
          <RoomList 
            loading={loading}
            error={error}
            rooms={filteredRooms}
            onJoinRoom={handleJoinRoom}
            onCreateRoom={() => setShowCreateModal(true)}
            onRetryConnection={retryConnection}
          />
        </div>
      </div>
      
      <CreateRoomModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRoom}
        roomName={newRoomName}
        onRoomNameChange={(e) => setNewRoomName(e.target.value)}
        isConnected={isConnected}
      />
    </div>
  );
};

export default Dashboard;