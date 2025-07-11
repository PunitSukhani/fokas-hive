import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getRoomDetails, joinRoom } from '../services/roomService';
import useSocket from '../hooks/useSocket';
import useTimer from '../hooks/useTimer';
import useChat from '../hooks/useChat';
import Timer from '../components/room/Timer';
import Chat from '../components/chat/Chat';
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

  // Check if current user is the host - simplified and more robust
  const isHost = useMemo(() => {
    if (!room?.host || !currentUser) return false;
    
    const hostId = room.host.id || room.host._id;
    const userId = currentUser.id || currentUser._id;
    
    return hostId === userId;
  }, [room?.host, currentUser]);

  // Timer functionality
  const timerHook = useTimer(socket, roomId, room?.timerState, isHost, room?.timerSettings);

  // Chat functionality
  const chatHook = useChat(socket, roomId, isConnected);

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
            const updatedRoom = await joinRoom(roomId);
            setRoom(updatedRoom); // Update with the room data that includes the user
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
    
    console.log('[RoomPage] Setting up socket listeners for room:', roomId);
    
    // Small delay to ensure REST API join completes first
    const timeoutId = setTimeout(() => {
      // Join the socket room
      socket.emit('join-room', { roomId });
    }, 100);
    
    // Listen for user list updates
    const handleUserListUpdated = (users) => {
      console.log('[RoomPage] Received user-list-updated:', users);
      setRoom(prevRoom => {
        if (!prevRoom) return prevRoom;
        
        // Deduplicate users by ID to prevent multiple instances
        const uniqueUsers = [];
        const seenUserIds = new Set();
        
        users.forEach(user => {
          const userId = user.id || user._id;
          if (userId && !seenUserIds.has(userId)) {
            seenUserIds.add(userId);
            uniqueUsers.push(user);
          }
        });
        
        return {
          ...prevRoom,
          users: uniqueUsers
        };
      });
    };
    
    // Listen for user joined
    const handleUserJoined = (userData) => {
      // Note: Chat system will handle join notifications
    };
    
    // Listen for user left
    const handleUserLeft = (userData) => {
      // Note: Chat system will handle leave notifications
    };
    
    // Listen for room updates
    const handleRoomJoined = (roomData) => {
      setRoom(roomData);
    };

    // Listen for timer events
    const handleTimerUpdate = (timerState) => {
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
      clearTimeout(timeoutId);
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
  }, [socket, isConnected, roomId, currentUser]); // Removed room dependency to fix real-time updates

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
              room={room}
              className="mb-6"
            />

            {/* Chat Section */}
            <Chat
              messages={chatHook.messages}
              onSendMessage={chatHook.sendMessage}
              currentUserId={currentUser?.id || currentUser?._id}
              hostId={room.host?.id || room.host?._id}
              isConnected={isConnected}
              loading={chatHook.loading}
            />
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
                {room.users?.map((user, index) => {
                  const userId = user.id || user._id;
                  const hostId = room.host?.id || room.host?._id;
                  const isUserHost = userId === hostId;
                  
                  return (
                    <div key={`user-${userId || index}-${roomId}`} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{user.name || 'Unknown User'}</p>
                        <p className="text-xs text-slate-500">
                          {isUserHost && '👑 Host'}
                        </p>
                      </div>
                    </div>
                  );
                }) || (
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
