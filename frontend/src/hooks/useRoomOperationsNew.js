import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { createRoom as createRoomAPI } from '../services/roomService';
import debounce from 'lodash.debounce';

const useRoomOperations = (socket, isSocketConnected, initialRooms = []) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRooms, setActiveRooms] = useState(initialRooms);
  const [filteredRooms, setFilteredRooms] = useState(initialRooms);
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

  // Update filtered rooms when active rooms change
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [activeRooms, debouncedSearch, searchTerm]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  // Handle create room - prefer REST API over Socket.IO
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    if (!newRoomName.trim()) {
      toast.warning('Please enter a room name', { toastId: 'empty-room-name' });
      return;
    }
    
    const roomData = {
      name: newRoomName.trim()
    };
    
    try {
      // Try REST API first
      toast.info('Creating room...', { 
        toastId: 'creating-room',
        autoClose: 2000
      });

      const createdRoom = await createRoomAPI(roomData);
      
      toast.success(`Room "${createdRoom.name}" created successfully!`, {
        toastId: 'room-created'
      });
      
      setShowCreateModal(false);
      setNewRoomName('');
      
      // Navigate to the created room
      navigate(`/room/${createdRoom._id}`);
      
    } catch (error) {
      console.error('Room creation error:', error);
      
      // Fallback to Socket.IO if REST API fails
      if (socket && isSocketConnected) {
        try {
          socket.emit('join-room', roomData);
          toast.info('Creating room via socket...', { 
            toastId: 'creating-room-socket',
            autoClose: 2000
          }); 
          setShowCreateModal(false);
          setNewRoomName('');
        } catch (socketError) {
          console.error('Socket room creation error:', socketError);
          toast.error('Failed to create room. Please try again.', { toastId: 'create-error' });
        }
      } else {
        toast.error(
          error.response?.data?.message || 'Failed to create room. Please try again.', 
          { toastId: 'create-error' }
        );
      }
    }
  };

  // Handle join room
  const handleJoinRoom = (roomId) => {
    if (!roomId) {
      toast.error('Invalid room ID', { toastId: 'invalid-room' });
      return;
    }
    
    try {
      toast.info('Joining room...', { 
        toastId: `join-${roomId}`,
        autoClose: 2000 
      });
      
      // Navigate to room - the room page will handle joining via Socket.IO
      navigate(`/room/${roomId}`);
      
    } catch (error) {
      toast.error('Failed to join room. Please try again.', { toastId: 'join-error' });
      console.error('Room join error:', error);
    }
  };

  // Update active rooms
  const updateActiveRooms = useCallback((rooms) => {
    const roomsArray = Array.isArray(rooms) ? rooms : [];
    setActiveRooms(roomsArray);
    
    // Apply current search filter
    if (searchTerm.trim()) {
      const filtered = roomsArray.filter(room => 
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRooms(filtered);
    } else {
      setFilteredRooms(roomsArray);
    }
  }, [searchTerm]);

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
