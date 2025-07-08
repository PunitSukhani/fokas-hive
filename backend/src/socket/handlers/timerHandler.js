import Room from '../../models/Room.js';

// Helper to check if user is the host
const isUserHost = (room, userId) => {
  return room.host.toString() === userId.toString();
};

export const handleStartTimer = async (io, socket, { roomId }) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) return;
    
    // Only host can control timer
    if (!isUserHost(room, socket.user.id)) {
      socket.emit('error', { message: 'Only host can control timer' });
      return;
    }
    
    // Update timer state
    room.timerState.isRunning = true;
    await room.save();
    
    // Broadcast timer state to room
    io.to(roomId).emit('timer-started', room.timerState);
  } catch (error) {
    console.error('Error starting timer:', error);
  }
};

export const handlePauseTimer = async (io, socket, { roomId, timeRemaining }) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) return;
    
    // Only host can control timer
    if (!isUserHost(room, socket.user.id)) {
      socket.emit('error', { message: 'Only host can control timer' });
      return;
    }
    
    // Update timer state
    room.timerState.isRunning = false;
    room.timerState.timeRemaining = timeRemaining;
    await room.save();
    
    // Broadcast timer state to room
    io.to(roomId).emit('timer-paused', room.timerState);
  } catch (error) {
    console.error('Error pausing timer:', error);
  }
};

export const handleResetTimer = async (io, socket, { roomId }) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) return;
    
    // Only host can control timer
    if (!isUserHost(room, socket.user.id)) {
      socket.emit('error', { message: 'Only host can control timer' });
      return;
    }
    
    // Update timer state based on current mode
    if (room.timerState.mode === 'focus') {
      room.timerState.timeRemaining = 25 * 60; // 25 minutes
    } else if (room.timerState.mode === 'shortBreak') {
      room.timerState.timeRemaining = 5 * 60; // 5 minutes
    } else {
      room.timerState.timeRemaining = 15 * 60; // 15 minutes
    }
    
    room.timerState.isRunning = false;
    await room.save();
    
    // Broadcast timer state to room
    io.to(roomId).emit('timer-reset', room.timerState);
  } catch (error) {
    console.error('Error resetting timer:', error);
  }
};

export const handleChangeTimerMode = async (io, socket, { roomId, mode }) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) return;
    
    // Only host can control timer
    if (!isUserHost(room, socket.user.id)) {
      socket.emit('error', { message: 'Only host can control timer' });
      return;
    }
    
    // Update timer state based on mode
    room.timerState.mode = mode;
    room.timerState.isRunning = false;
    
    switch (mode) {
      case 'focus':
        room.timerState.timeRemaining = 25 * 60; // 25 minutes
        break;
      case 'shortBreak':
        room.timerState.timeRemaining = 5 * 60; // 5 minutes
        break;
      case 'longBreak':
        room.timerState.timeRemaining = 15 * 60; // 15 minutes
        break;
    }
    
    // Increment cycle count if switching from focus to break
    if (mode !== 'focus') {
      room.timerState.cycleCount++;
    }
    
    await room.save();
    
    // Broadcast timer state to room
    io.to(roomId).emit('timer-mode-changed', room.timerState);
  } catch (error) {
    console.error('Error changing timer mode:', error);
  }
};
