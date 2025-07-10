import React, { useState, useEffect } from 'react';
import { HiPlay, HiPause, HiStop, HiRefresh } from 'react-icons/hi';

const TimerDisplay = ({ 
  timerState, 
  isHost, 
  onStart, 
  onPause, 
  onReset, 
  onModeChange,
  socket,
  roomId 
}) => {
  const [localTime, setLocalTime] = useState(timerState?.timeRemaining || 0);
  const [isRunning, setIsRunning] = useState(timerState?.isRunning || false);

  // Sync with timer state from socket
  useEffect(() => {
    if (timerState) {
      setLocalTime(timerState.timeRemaining);
      setIsRunning(timerState.isRunning);
    }
  }, [timerState]);

  // Local countdown when timer is running
  useEffect(() => {
    let interval = null;
    
    if (isRunning && localTime > 0) {
      interval = setInterval(() => {
        setLocalTime(prevTime => {
          const newTime = prevTime - 1;
          
          // Timer completed
          if (newTime <= 0) {
            setIsRunning(false);
            // Only host should trigger completion event
            if (isHost && socket) {
              socket.emit('timer-completed', { roomId });
            }
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning, localTime, isHost, socket, roomId]);

  // Format time display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get mode display info
  const getModeInfo = (mode) => {
    const modeConfig = {
      focus: { 
        label: 'Focus Session', 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50',
        icon: '🎯'
      },
      shortBreak: { 
        label: 'Short Break', 
        color: 'text-green-600', 
        bgColor: 'bg-green-50',
        icon: '☕'
      },
      longBreak: { 
        label: 'Long Break', 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-50',
        icon: '🌟'
      }
    };
    return modeConfig[mode] || modeConfig.focus;
  };

  const currentMode = timerState?.mode || 'focus';
  const modeInfo = getModeInfo(currentMode);
  const cycleCount = timerState?.cycleCount || 0;

  // Calculate progress percentage
  const getProgress = () => {
    const totalTime = {
      focus: 25 * 60,
      shortBreak: 5 * 60,
      longBreak: 15 * 60
    }[currentMode];
    
    return totalTime > 0 ? ((totalTime - localTime) / totalTime) * 100 : 0;
  };

  const progress = getProgress();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      {/* Header */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${modeInfo.bgColor} ${modeInfo.color} text-sm font-medium mb-2`}>
          <span>{modeInfo.icon}</span>
          <span>{modeInfo.label}</span>
        </div>
        
        {cycleCount > 0 && (
          <div className="text-sm text-gray-500">
            Completed cycles: {cycleCount}
          </div>
        )}
      </div>

      {/* Progress Ring */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={modeInfo.color.replace('text-', '#')}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        
        {/* Time Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-3xl font-bold ${modeInfo.color}`}>
              {formatTime(localTime)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {isRunning ? 'Running' : 'Paused'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {isHost ? (
        <div className="flex justify-center gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={isRunning ? onPause : onStart}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
              isRunning 
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            disabled={localTime <= 0}
          >
            {isRunning ? <HiPause size={20} /> : <HiPlay size={20} />}
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-all"
          >
            <HiRefresh size={20} />
          </button>

          {/* Mode Selector */}
          <select
            value={currentMode}
            onChange={(e) => onModeChange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isRunning}
          >
            <option value="focus">Focus (25min)</option>
            <option value="shortBreak">Short Break (5min)</option>
            <option value="longBreak">Long Break (15min)</option>
          </select>
        </div>
      ) : (
        <div className="text-center text-sm text-gray-500">
          Only the host can control the timer
        </div>
      )}

      {/* Timer completion notification */}
      {localTime === 0 && !isRunning && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
          <div className="text-green-800 font-medium">
            {modeInfo.label} completed! 🎉
          </div>
          <div className="text-green-600 text-sm mt-1">
            {currentMode === 'focus' 
              ? 'Great job! Time for a break.' 
              : 'Break time is over. Ready to focus?'
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerDisplay;
