import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useSocket from '../hooks/useSocket';
import useRoomOperations from '../hooks/useRoomOperations';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SearchAndCreateBar from '../components/dashboard/SearchAndCreateBar';
import RoomList from '../components/dashboard/RoomList';
import CreateRoomModal from '../components/dashboard/CreateRoomModal';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Server URL configuration - could be moved to .env file
const SOCKET_SERVER_URL = 'http://localhost:5000';

const Dashboard = () => {
  // Socket hook for real-time communication
  const { socket, isConnected: socketConnected, connectionError, reconnect } = useSocket(SOCKET_SERVER_URL);
  
  // State for active rooms (now via Socket.IO)
  const [activeRooms, setActiveRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Room operations hook (updated to work with both Socket.IO and REST API)
  const {
    searchTerm,
    filteredRooms,
    showCreateModal,
    newRoomName,
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    setShowCreateModal,
    setNewRoomName,
    setFocusDuration,
    setShortBreakDuration,
    setLongBreakDuration,
    handleSearchChange,
    handleCreateRoom,
    handleJoinRoom,
    updateActiveRooms
  } = useRoomOperations(socket, socketConnected, activeRooms);

  // Fetch active rooms via Socket.IO
  useEffect(() => {
    if (!socket || !socketConnected) return;

    const handleActiveRooms = (rooms) => {
      setActiveRooms(rooms || []);
      setLoading(false);
      setError(null);
    };

    const handleRoomError = (errorData) => {
      setError(errorData.message || 'Failed to load rooms');
      setLoading(false);
    };

    // Listen for active rooms updates
    socket.on('active-rooms', handleActiveRooms);
    socket.on('error', handleRoomError);

    // Request initial active rooms
    socket.emit('get-active-rooms');

    return () => {
      socket.off('active-rooms', handleActiveRooms);
      socket.off('error', handleRoomError);
    };
  }, [socket, socketConnected]);

  // Update filtered rooms when active rooms change
  useEffect(() => {
    updateActiveRooms(activeRooms);
  }, [activeRooms, updateActiveRooms]);

  // Setup socket event listeners for room creation
  useEffect(() => {
    if (!socket) return;

    let isMounted = true;
    const recentlyDeletedRooms = new Set(); // Track recently deleted rooms to prevent duplicate notifications

    const handleRoomCreated = (roomData) => {
      if (isMounted) {
        toast.success(`Room "${roomData.name || 'New Room'}" created successfully!`);
        // Request updated rooms list
        socket.emit('get-active-rooms');
      }
    };

    const handleRoomDeleted = (data) => {
      if (isMounted) {
        // Prevent duplicate notifications for the same room within 5 seconds
        const roomKey = `${data.roomId}-${data.roomName}`;
        if (recentlyDeletedRooms.has(roomKey)) {
          console.log('Duplicate room deletion notification prevented for:', data.roomName);
          return;
        }
        
        recentlyDeletedRooms.add(roomKey);
        // Clean up after 5 seconds
        setTimeout(() => {
          recentlyDeletedRooms.delete(roomKey);
        }, 5000);
        
        toast.info(`Room "${data.roomName}" was deleted`, {
          toastId: `room-deleted-${data.roomId}` // Use unique toast ID to prevent duplicate toasts
        });
        // Request updated rooms list
        socket.emit('get-active-rooms');
      }
    };

    // Setup socket event listeners
    socket.on('room-created', handleRoomCreated);
    socket.on('room-deleted', handleRoomDeleted);

    // Cleanup function
    return () => {
      isMounted = false;
      socket.off('room-created', handleRoomCreated);
      socket.off('room-deleted', handleRoomDeleted);
    };
  }, [socket]);

  // Handle connection errors and initial loading state
  useEffect(() => {
    if (connectionError && !socketConnected) {
      console.error('Socket.IO connection failed:', connectionError);
      setError('Failed to connect to server. Please try again later.');
      setLoading(false);
    } else if (socketConnected) {
      // If connection is working, clear errors
      setError(null);
    }
  }, [connectionError, socketConnected]);

  // Function to retry connection
  const retryConnection = () => {
    console.log('Retrying connection...');
    setLoading(true);
    setError(null);
    
    toast.info('Reconnecting to server...', { 
      toastId: 'reconnecting',
      autoClose: 2000
    });
    
    reconnect(); // Retry Socket.IO
    
    // Request active rooms again after reconnection
    setTimeout(() => {
      if (socket && socket.connected) {
        socket.emit('get-active-rooms');
      }
    }, 1000);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <DashboardHeader />
          
          {/* Connection Status Indicator */}
          <div className="mb-4 flex gap-2 text-sm">
            <div className={`px-2 py-1 rounded text-xs ${
              socketConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              Socket.IO: {socketConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>

          <SearchAndCreateBar 
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onCreateRoom={() => setShowCreateModal(true)}
            isConnected={socketConnected}
          />
          
          <div className="mt-8">
            <RoomList 
              loading={loading}
              error={error}
              rooms={filteredRooms}
              onJoinRoom={handleJoinRoom}
              onCreateRoom={() => setShowCreateModal(true)}
              onRetryConnection={retryConnection}
              userPresence={{}}
            />
          </div>
        </div>
        
        <CreateRoomModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRoom}
          roomName={newRoomName}
          onRoomNameChange={(e) => setNewRoomName(e.target.value)}
          focusDuration={focusDuration}
          shortBreakDuration={shortBreakDuration}
          longBreakDuration={longBreakDuration}
          onFocusDurationChange={(e) => {
            const value = e.target.value;
            setFocusDuration(value === '' ? '' : parseInt(value) || 1);
          }}
          onShortBreakDurationChange={(e) => {
            const value = e.target.value;
            setShortBreakDuration(value === '' ? '' : parseInt(value) || 1);
          }}
          onLongBreakDurationChange={(e) => {
            const value = e.target.value;
            setLongBreakDuration(value === '' ? '' : parseInt(value) || 1);
          }}
          isConnected={socketConnected}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;