import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getRoomDetails, joinRoom } from '../services/roomService';
import useSocket from '../hooks/useSocket';
import useTimer from '../hooks/useTimer';
import Timer from '../components/room/Timer';
import { HiArrowLeft, HiUsers } from 'react-icons/hi';

const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Socket connection for real-time updates
  const { socket, isConnected } = useSocket('http://localhost:5000');

  // Check if current user is the host
  const isHost = room?.host && (
    currentUser?.id === room.host.id || 
    currentUser?.id === room.host._id ||
    currentUser?._id === room.host.id ||
    currentUser?._id === room.host._id
  );

  // Timer functionality
  const timerHook = useTimer(socket, roomId, room?.timerState, isHost, room?.timerSettings);

  // Fetch room details and join the room
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const roomData = await getRoomDetails(roomId);
        setRoom(roomData);
        setError(null);
        
        // Join the room via REST API first, then join socket room
        if (roomData && currentUser) {
          try {
            await joinRoom(roomId);
            console.log('Successfully joined room via REST API');
          } catch (joinError) {
            console.warn('Failed to join room via REST API:', joinError);
          }
        }
      } catch (error) {
        console.error('Error fetching room:', error);
        setError('Failed to load room');
        toast.error('Failed to load room details');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId, currentUser]);
  
  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket || !isConnected || !roomId || !currentUser) return;
    
    console.log('Setting up socket listeners for room:', roomId);
    
    // Join the socket room
    socket.emit('join-room', { roomId });
    
    // Listen for user list updates
    const handleUserListUpdated = (users) => {
      console.log('User list updated:', users);
      setRoom(prevRoom => {
        if (!prevRoom) return prevRoom;
        return {
          ...prevRoom,
          users: users // Backend now sends properly formatted user data
        };
      });
    };
    
    // Listen for user joined
    const handleUserJoined = (userData) => {
      console.log('User joined room:', userData);
      toast.info(`${userData.name} joined the room`);
    };
    
    // Listen for user left
    const handleUserLeft = (userData) => {
      console.log('User left room:', userData);
      toast.info(`${userData.name} left the room`);
    };
    
    // Listen for room updates
    const handleRoomJoined = (roomData) => {
      console.log('Room joined event received:', roomData);
      setRoom(roomData);
    };

    // Listen for timer events
    const handleTimerUpdate = (timerState) => {
      console.log('Timer state updated:', timerState);
      setRoom(prevRoom => {
        if (!prevRoom) return prevRoom;
        return {
          ...prevRoom,
          timerState: timerState
        };
      });
    };
    
    // Set up event listeners
    socket.on('user-list-updated', handleUserListUpdated);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('room-joined', handleRoomJoined);
    
    // Timer event listeners (additional to useTimer hook)
    socket.on('timer-started', handleTimerUpdate);
    socket.on('timer-paused', handleTimerUpdate);
    socket.on('timer-reset', handleTimerUpdate);
    socket.on('timer-mode-changed', handleTimerUpdate);
    
    // Cleanup
    return () => {
      console.log('Cleaning up socket listeners for room:', roomId);
      socket.off('user-list-updated', handleUserListUpdated);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('room-joined', handleRoomJoined);
      socket.off('timer-started', handleTimerUpdate);
      socket.off('timer-paused', handleTimerUpdate);
      socket.off('timer-reset', handleTimerUpdate);
      socket.off('timer-mode-changed', handleTimerUpdate);
      
      // Leave the socket room when component unmounts or roomId changes
      socket.emit('leave-room', { roomId });
    };
  }, [socket, isConnected, roomId, currentUser]);

  const handleBackToDashboard = () => {
    // Leave the room before navigating away
    if (socket && isConnected && roomId) {
      socket.emit('leave-room', { roomId });
    }
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Room Not Found</h1>
          <p className="text-slate-600 mb-6">The room you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={handleBackToDashboard}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <HiArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToDashboard}
              className="bg-white text-slate-700 p-2 rounded-lg shadow hover:shadow-md transition-all border border-slate-200"
            >
              <HiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{room.name}</h1>
              <p className="text-slate-500">
                Host: {room.host?.name || 'Unknown'} • {room.users?.length || 0} members
              </p>
            </div>
          </div>
        </div>

        {/* Room Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Timer Section */}
            <Timer
              timerState={timerHook}
              onStart={timerHook.startTimer}
              onPause={timerHook.pauseTimer}
              onReset={timerHook.resetTimer}
              onModeChange={timerHook.changeMode}
              canControl={timerHook.canControl}
              className="mb-6"
            />

            {/* Chat Section - Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-50 p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Chat</h2>
              <div className="bg-gray-50 rounded-lg p-6 text-center text-slate-500">
                Chat functionality coming soon...
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Members Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-50 p-6 mb-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <HiUsers size={20} />
                Members ({room.users?.length || 0})
              </h3>
              
              <div className="space-y-3">
                {room.users?.map((user, index) => (
                  <div key={`room-${roomId}-user-${user.id || user._id || index}`} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{user.name || 'Unknown User'}</p>
                      <p className="text-xs text-slate-500">
                        {(user.id === room.host?.id || user.id === room.host?._id || user._id === room.host?.id || user._id === room.host?._id) && '👑 Host'}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-slate-500 text-center">No members found</p>
                )}
              </div>
            </div>

            {/* Room Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-50 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Room Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Created:</span>
                  <span className="text-slate-800">
                    {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Room ID:</span>
                  <span className="text-slate-800 font-mono text-xs">{roomId}</span>
                </div>
                {room.timerSettings && (
                  <>
                    <div className="border-t pt-2 mt-3">
                      <div className="text-slate-500 mb-2 font-medium">Timer Settings</div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Focus Session:</span>
                          <span className="text-slate-800">{Math.round(room.timerSettings.focusDuration / 60)} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Short Break:</span>
                          <span className="text-slate-800">{Math.round(room.timerSettings.shortBreakDuration / 60)} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Long Break:</span>
                          <span className="text-slate-800">{Math.round(room.timerSettings.longBreakDuration / 60)} minutes</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
