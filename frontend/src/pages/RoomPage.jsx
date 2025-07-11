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
import { HiArrowLeft, HiUsers, HiChevronDown, HiChevronUp } from 'react-icons/hi';

const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [membersCollapsed, setMembersCollapsed] = useState(true); // Start collapsed on mobile
  
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
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToDashboard}
              className="bg-white text-slate-700 p-2 rounded-lg shadow hover:shadow-md transition-all border border-slate-200"
            >
              <HiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{room.name}</h1>
              <p className="text-slate-500 text-sm">
                Host: {room.host?.name || 'Unknown'} • {room.users?.length || 0} members
              </p>
            </div>
          </div>
          
          {/* Compact Members Display */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex -space-x-2">
              {room.users?.slice(0, 4).map((user, index) => {
                const userId = user.id || user._id;
                const hostId = room.host?.id || room.host?._id;
                const isUserHost = userId === hostId;
                
                return (
                  <div 
                    key={`header-user-${userId || index}`}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2 border-white ${
                      isUserHost ? 'bg-blue-500' : 'bg-gray-500'
                    }`}
                    title={`${user.name || 'Unknown User'}${isUserHost ? ' (Host)' : ''}`}
                  >
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                );
              })}
              {room.users?.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-600">
                  +{room.users.length - 4}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Layout - Timer Always Prominent */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-180px)]">
          {/* Timer Section - Takes 2/3 width on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-full">
              <Timer
                timerState={timerHook}
                onStart={timerHook.startTimer}
                onPause={timerHook.pauseTimer}
                onReset={timerHook.resetTimer}
                onModeChange={timerHook.changeMode}
                canControl={timerHook.canControl}
                room={room}
                className="border-0 shadow-none rounded-none p-0 h-full"
              />
            </div>
          </div>

          {/* Chat Sidebar - Takes 1/3 width */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-800">Chat</h3>
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>
              </div>
              
              {/* Chat Content */}
              <div className="flex-1 min-h-0">
                <Chat
                  messages={chatHook.messages}
                  onSendMessage={chatHook.sendMessage}
                  currentUserId={currentUser?.id || currentUser?._id}
                  hostId={room.host?.id || room.host?._id}
                  isConnected={isConnected}
                  loading={chatHook.loading}
                  showHeader={false}
                  className="h-full border-0 shadow-none rounded-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Members Toggle */}
        <div className="md:hidden mt-4">
          <button
            onClick={() => setMembersCollapsed(!membersCollapsed)}
            className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <HiUsers className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-800">
                View Members ({room.users?.length || 0})
              </span>
            </div>
            {membersCollapsed ? (
              <HiChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <HiChevronUp className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          {!membersCollapsed && (
            <div className="mt-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="grid grid-cols-2 gap-2">
                {room.users?.map((user, index) => {
                  const userId = user.id || user._id;
                  const hostId = room.host?.id || room.host?._id;
                  const isUserHost = userId === hostId;
                  
                  return (
                    <div 
                      key={`mobile-user-${userId || index}`} 
                      className={`flex items-center gap-2 px-2 py-1 rounded-lg text-sm ${
                        isUserHost 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold text-white ${
                        isUserHost ? 'bg-blue-500' : 'bg-gray-500'
                      }`}>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className={`font-medium truncate ${
                        isUserHost ? 'text-blue-700' : 'text-slate-700'
                      }`}>
                        {user.name || 'Unknown'}
                        {isUserHost && ' (Host)'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
