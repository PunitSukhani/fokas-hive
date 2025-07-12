import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { createRoom as createRoomAPI, getActiveRooms } from '../services/roomService';
import debounce from 'lodash.debounce';

/**
 * Custom hook for managing room operations in the dashboard
 * 
 * Handles room creation, joining, searching, and state management.
 * Provides both Socket.IO and REST API integration for room operations.
 * Manages UI state for room list, search functionality, and modal dialogs.
 * 
 * @param {Object} socket - Socket.IO instance for real-time communication
 * @param {boolean} isSocketConnected - Current socket connection status
 * @param {Array} initialRooms - Initial list of rooms to display
 * @returns {Object} Room operations state and methods
 * @returns {string} searchTerm - Current search input value
 * @returns {Array} filteredRooms - Rooms filtered by search term
 * @returns {boolean} showCreateModal - Whether create room modal is visible
 * @returns {string} newRoomName - Current room name input value
 * @returns {number} focusDuration - Focus timer duration in minutes
 * @returns {number} shortBreakDuration - Short break timer duration in minutes
 * @returns {number} longBreakDuration - Long break timer duration in minutes
 * @returns {Function} setShowCreateModal - Toggle create room modal visibility
 * @returns {Function} setNewRoomName - Update room name input
 * @returns {Function} setFocusDuration - Update focus duration setting
 * @returns {Function} setShortBreakDuration - Update short break duration setting
 * @returns {Function} setLongBreakDuration - Update long break duration setting
 * @returns {Function} handleSearchChange - Handle search input changes
 * @returns {Function} handleCreateRoom - Create a new room
 * @returns {Function} handleJoinRoom - Join an existing room
 * @returns {Function} updateActiveRooms - Update the active rooms list
 */
const useRoomOperations = (socket, isSocketConnected, initialRooms = []) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRooms, setActiveRooms] = useState(initialRooms);
  const [filteredRooms, setFilteredRooms] = useState(initialRooms);
  
  // Modal and form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  
  // Timer duration states (in minutes) - Pomodoro technique defaults
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);

  /**
   * Debounced search functionality to prevent excessive filtering operations
   * Filters rooms by name using case-insensitive matching
   */
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
    }, 300), // 300ms delay to avoid excessive API calls
    [activeRooms]
  );

  // Update filtered rooms when active rooms change
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [activeRooms, debouncedSearch, searchTerm]);

  /**
   * Handle search input changes with debouncing
   * @param {Event} e - Input change event
   */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  /**
   * Handle room creation
   * Attempts to create room via REST API first, falls back to Socket.IO if needed
   * @param {Event} e - Form submit event
   */
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    if (!newRoomName.trim()) {
      toast.warning('Please enter a room name', { toastId: 'empty-room-name' });
      return;
    }
    
    // Validate timer durations - use defaults if empty
    const finalFocusDuration = focusDuration === '' ? 25 : focusDuration;
    const finalShortBreakDuration = shortBreakDuration === '' ? 5 : shortBreakDuration;
    const finalLongBreakDuration = longBreakDuration === '' ? 15 : longBreakDuration;
    
    if (finalFocusDuration < 1 || finalFocusDuration > 180) {
      toast.error('Focus duration must be between 1 and 180 minutes', { toastId: 'invalid-focus' });
      return;
    }
    if (finalShortBreakDuration < 1 || finalShortBreakDuration > 60) {
      toast.error('Short break duration must be between 1 and 60 minutes', { toastId: 'invalid-short-break' });
      return;
    }
    if (finalLongBreakDuration < 1 || finalLongBreakDuration > 180) {
      toast.error('Long break duration must be between 1 and 180 minutes', { toastId: 'invalid-long-break' });
      return;
    }
    
    let roomName = newRoomName.trim();
    
    // Debug: Check existing rooms before creating
    try {
      const existingRooms = await getActiveRooms();
      console.log('Existing rooms before creation:', existingRooms);
      console.log('Attempting to create room with name:', roomName);
      
      // Check for exact name match (case sensitive)
      const conflictingRoom = existingRooms.find(room => room.name === roomName);
      if (conflictingRoom) {
        console.log('Found conflicting room:', conflictingRoom);
      }
    } catch (debugError) {
      console.warn('Could not fetch existing rooms for debug:', debugError);
    }
    
    const roomData = {
      name: roomName,
      focusDuration: finalFocusDuration,
      shortBreakDuration: finalShortBreakDuration,
      longBreakDuration: finalLongBreakDuration
    };
    
    try {
      // Try REST API first
      toast.info('Creating room...', { 
        toastId: 'creating-room',
        autoClose: 2000
      });
      
      const createdRoom = await createRoomAPI(roomData);
      
      // Check if creation was successful
      if (!createdRoom || !createdRoom._id) {
        throw new Error('Invalid response from server');
      }
      
      toast.success(`Room "${createdRoom.name}" created successfully!`, {
        toastId: 'room-created'
      });
      
      setShowCreateModal(false);
      setNewRoomName('');
      // Reset timer durations to defaults
      setFocusDuration(25);
      setShortBreakDuration(5);
      setLongBreakDuration(15);
      
      // Navigate to the created room
      navigate(`/room/${createdRoom._id}`);
      
    } catch (error) {
      console.error('Room creation error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        roomName: roomName,
        roomData: roomData
      });
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        // Room name already exists - ask user to choose a different name
        const errorMessage = error.response?.data?.message || `Room name "${roomName}" is already taken. Please choose a different name.`;
        toast.error(errorMessage, { 
          toastId: 'room-exists' 
        });
        return;
      }
      
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

  /**
   * Handle join room
   * Navigates to the room page, which handles joining via Socket.IO
   * @param {string} roomId - ID of the room to join
   */
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

  /**
   * Update the active rooms list
   * Applies current search filter to the new rooms list
   * @param {Array} rooms - New list of active rooms
   */
  const updateActiveRooms = useCallback((rooms) => {
    const roomsArray = Array.isArray(rooms) ? rooms : [];
    setActiveRooms(roomsArray);
    
    // Apply current search filter to new rooms
    if (!searchTerm.trim()) {
      setFilteredRooms(roomsArray);
    } else {
      const filtered = roomsArray.filter(room => 
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRooms(filtered);
    }
  }, [searchTerm]);

  // Return all state and methods for use in components
  return {
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
  };
};

export default useRoomOperations;
