import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing timer functionality in study rooms
 * Handles countdown, state management, and socket communication
 */
const useTimer = (socket, roomId, initialTimerState = null, isHost = false, timerSettings = null) => {
  const [timerState, setTimerState] = useState({
    mode: 'focus',
    timeRemaining: 25 * 60, // 25 minutes in seconds
    isRunning: false,
    cycleCount: 0,
    ...initialTimerState
  });

  const [localTimeRemaining, setLocalTimeRemaining] = useState(timerState.timeRemaining);
  const intervalRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());

  // Timer durations in seconds - use room settings if available, otherwise defaults
  const TIMER_DURATIONS = {
    focus: timerSettings?.focusDuration || 25 * 60,      // 25 minutes
    shortBreak: timerSettings?.shortBreakDuration || 5 * 60,  // 5 minutes
    longBreak: timerSettings?.longBreakDuration || 15 * 60   // 15 minutes
  };

  // Update timer state when props change
  useEffect(() => {
    if (initialTimerState) {
      setTimerState(prevState => ({
        ...prevState,
        ...initialTimerState
      }));
      setLocalTimeRemaining(initialTimerState.timeRemaining || prevState.timeRemaining);
    }
  }, [initialTimerState]);

  // Get mode display name
  const getModeDisplayName = useCallback((mode) => {
    const modeNames = {
      focus: 'Focus Session',
      shortBreak: 'Short Break',
      longBreak: 'Long Break'
    };
    return modeNames[mode] || mode;
  }, []);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleTimerStarted = (newTimerState) => {
      console.log('Timer started:', newTimerState);
      setTimerState(newTimerState);
      setLocalTimeRemaining(newTimerState.timeRemaining);
      lastUpdateRef.current = Date.now();
      toast.success('Timer started!', { toastId: 'timer-started' });
    };

    const handleTimerPaused = (newTimerState) => {
      console.log('Timer paused:', newTimerState);
      setTimerState(newTimerState);
      setLocalTimeRemaining(newTimerState.timeRemaining);
      toast.info('Timer paused', { toastId: 'timer-paused' });
    };

    const handleTimerReset = (newTimerState) => {
      console.log('Timer reset:', newTimerState);
      setTimerState(newTimerState);
      setLocalTimeRemaining(newTimerState.timeRemaining);
      toast.info('Timer reset', { toastId: 'timer-reset' });
    };

    const handleTimerModeChanged = (newTimerState) => {
      console.log('Timer mode changed:', newTimerState);
      setTimerState(newTimerState);
      setLocalTimeRemaining(newTimerState.timeRemaining);
      toast.success(`Switched to ${newTimerState.mode} mode`, { toastId: 'timer-mode-changed' });
    };

    const handleTimerCompleted = (data) => {
      console.log('Timer completed:', data);
      setTimerState(prevState => ({ ...prevState, isRunning: false }));
      setLocalTimeRemaining(0);
      
      const { completedMode, suggestedNextMode, cycleCount } = data;
      
      toast.success(`🎉 ${getModeDisplayName(completedMode)} completed! Great work!`, { 
        toastId: 'timer-completed',
        autoClose: 5000 
      });
      
      // Show suggestion for next mode
      if (suggestedNextMode && isHost) {
        toast.info(`💡 Consider switching to ${getModeDisplayName(suggestedNextMode)} next`, {
          toastId: 'timer-suggestion',
          autoClose: 8000
        });
      }
    };

    const handleError = (error) => {
      console.error('Timer error:', error);
      toast.error(error.message || 'Timer operation failed', { toastId: 'timer-error' });
    };

    // Register event listeners
    socket.on('timer-started', handleTimerStarted);
    socket.on('timer-paused', handleTimerPaused);
    socket.on('timer-reset', handleTimerReset);
    socket.on('timer-mode-changed', handleTimerModeChanged);
    socket.on('timer-completed', handleTimerCompleted);
    socket.on('error', handleError);

    return () => {
      socket.off('timer-started', handleTimerStarted);
      socket.off('timer-paused', handleTimerPaused);
      socket.off('timer-reset', handleTimerReset);
      socket.off('timer-mode-changed', handleTimerModeChanged);
      socket.off('timer-completed', handleTimerCompleted);
      socket.off('error', handleError);
    };
  }, [socket]);

  // Local countdown logic
  useEffect(() => {
    if (timerState.isRunning && localTimeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setLocalTimeRemaining(prevTime => {
          const newTime = prevTime - 1;
          
          // Timer completed
          if (newTime <= 0) {
            // Notify server about completion
            if (socket && isHost) {
              socket.emit('timer-completed', { roomId });
            }
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState.isRunning, localTimeRemaining, socket, isHost, roomId]);

  // Timer control functions (only for host)
  const startTimer = useCallback(() => {
    if (!socket || !isHost) {
      toast.error('Only the host can control the timer', { toastId: 'timer-permission' });
      return;
    }

    console.log('Starting timer for room:', roomId);
    socket.emit('start-timer', { roomId });
  }, [socket, isHost, roomId]);

  const pauseTimer = useCallback(() => {
    if (!socket || !isHost) {
      toast.error('Only the host can control the timer', { toastId: 'timer-permission' });
      return;
    }

    console.log('Pausing timer for room:', roomId, 'Time remaining:', localTimeRemaining);
    socket.emit('pause-timer', { roomId, timeRemaining: localTimeRemaining });
  }, [socket, isHost, roomId, localTimeRemaining]);

  const resetTimer = useCallback(() => {
    if (!socket || !isHost) {
      toast.error('Only the host can control the timer', { toastId: 'timer-permission' });
      return;
    }

    console.log('Resetting timer for room:', roomId);
    socket.emit('reset-timer', { roomId });
  }, [socket, isHost, roomId]);

  const changeMode = useCallback((newMode) => {
    if (!socket || !isHost) {
      toast.error('Only the host can control the timer', { toastId: 'timer-permission' });
      return;
    }

    if (!['focus', 'shortBreak', 'longBreak'].includes(newMode)) {
      toast.error('Invalid timer mode', { toastId: 'timer-invalid-mode' });
      return;
    }

    console.log('Changing timer mode for room:', roomId, 'to:', newMode);
    socket.emit('change-timer-mode', { roomId, mode: newMode });
  }, [socket, isHost, roomId]);

  // Format time for display
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }, []);

  // Calculate progress percentage
  const getProgress = useCallback(() => {
    const totalTime = TIMER_DURATIONS[timerState.mode] || TIMER_DURATIONS.focus;
    return ((totalTime - localTimeRemaining) / totalTime) * 100;
  }, [timerState.mode, localTimeRemaining, TIMER_DURATIONS]);

  return {
    // Timer state
    timerState: {
      ...timerState,
      timeRemaining: localTimeRemaining
    },
    
    // Control functions
    startTimer,
    pauseTimer,
    resetTimer,
    changeMode,
    
    // Helper functions
    formatTime,
    getModeDisplayName,
    getProgress,
    
    // Computed values
    isRunning: timerState.isRunning,
    mode: timerState.mode,
    timeRemaining: localTimeRemaining,
    formattedTime: formatTime(localTimeRemaining),
    modeDisplayName: getModeDisplayName(timerState.mode),
    progress: getProgress(),
    canControl: isHost,
    cycleCount: timerState.cycleCount,
    
    // Timer durations for reference
    TIMER_DURATIONS
  };
};

export default useTimer;
