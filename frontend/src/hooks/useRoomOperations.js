import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import debounce from 'lodash.debounce';

const useRoomOperations = (socket, isConnected) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRooms, setActiveRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  // Search functionality with debounce
  const debouncedSearch = useCallback(
    debounce((term) => {
      if (!term.trim()) {
        setFilteredRooms(activeRooms);
      } else {
        const filtered = activeRooms.filter(room => 
          room.name.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredRooms(filtered);
      }
    }, 300),
    [activeRooms]
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  // Handle create room
  const handleCreateRoom = (e) => {
    e.preventDefault();
    
    if (!socket || !isConnected) {
      toast.error('Cannot create room: No server connection', { toastId: 'no-connection' });
      return;
    }
    
    if (!newRoomName.trim()) {
      toast.warning('Please enter a room name', { toastId: 'empty-room-name' });
      return;
    }
    
    const roomData = {
      name: newRoomName,
      createdBy: currentUser?._id || currentUser?.id,
      timestamp: new Date().toISOString()
    };
    
    try {
      socket.emit('join-room', roomData);
      toast.info('Creating room...', { 
        toastId: 'creating-room',
        autoClose: 2000
      }); 
      setShowCreateModal(false);
      setNewRoomName('');
    } catch (error) {
      toast.error('Failed to create room. Please try again.', { toastId: 'create-error' });
      console.error('Room creation error:', error);
    }
  };

  // Handle join room
  const handleJoinRoom = (roomId) => {
    if (!socket || !isConnected) {
      toast.error('Cannot join room: No server connection', { toastId: 'no-connection' });
      return;
    }
    
    try {
      socket.emit('join-room', { roomId });
      toast.info('Joining room...', { 
        toastId: `join-${roomId}`,
        autoClose: 2000 
      });
      navigate(`/room/${roomId}`);
    } catch (error) {
      toast.error('Failed to join room. Please try again.', { toastId: 'join-error' });
      console.error('Room join error:', error);
    }
  };

  // Update active rooms
  const updateActiveRooms = (rooms) => {
    setActiveRooms(rooms || []);
    setFilteredRooms(rooms || []);
  };

  return {
    searchTerm,
    activeRooms,
    filteredRooms,
    showCreateModal,
    newRoomName,
    setShowCreateModal,
    setNewRoomName,
    handleSearchChange,
    handleCreateRoom,
    handleJoinRoom,
    updateActiveRooms
  };
};

export default useRoomOperations;
