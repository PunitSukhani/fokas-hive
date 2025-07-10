import React from 'react';
import { HiPlay, HiPause } from 'react-icons/hi';
import { HiArrowPath } from 'react-icons/hi2';

const Timer = ({ 
  timerState, 
  onStart, 
  onPause, 
  onReset, 
  onModeChange, 
  canControl = false,
  className = "",
  room
}) => {
  // Format time to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get progress percentage for circular progress bar
  const getProgress = () => {
    if (!timerState.totalTime || timerState.totalTime === 0) return 0;
    return ((timerState.totalTime - timerState.timeRemaining) / timerState.totalTime) * 100;
  };

  // Get mode display name
  const getModeDisplayName = (mode) => {
    switch (mode) {
      case 'focus': return 'Focus Session';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
      default: return 'Focus Session';
    }
  };

  // Get timer duration for mode
  const getModeDuration = (mode) => {
    if (!room?.timerSettings) {
      // Default durations
      const defaults = { focus: 25, shortBreak: 5, longBreak: 15 };
      return defaults[mode] || 25;
    }
    
    switch (mode) {
      case 'focus': return Math.floor(room.timerSettings.focusDuration / 60);
      case 'shortBreak': return Math.floor(room.timerSettings.shortBreakDuration / 60);
      case 'longBreak': return Math.floor(room.timerSettings.longBreakDuration / 60);
      default: return 25;
    }
  };

  const progress = getProgress();
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md mx-auto ${className}`}>
      {/* Circular Timer Display */}
      <div className="relative flex items-center justify-center mb-8">
        <svg className="transform -rotate-90 w-80 h-80">
          {/* Background circle */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="#3B82F6"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ 
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
          {/* Progress dot */}
          {progress > 0 && (
            <circle
              cx={160 + radius * Math.cos((progress / 100) * 2 * Math.PI - Math.PI / 2)}
              cy={160 + radius * Math.sin((progress / 100) * 2 * Math.PI - Math.PI / 2)}
              r="6"
              fill="#3B82F6"
            />
          )}
        </svg>
        
        {/* Timer Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-6xl font-bold text-blue-600 mb-2">
            {formatTime(timerState.timeRemaining || 0)}
          </div>
          <div className="text-lg text-gray-600 mb-1">
            {getModeDisplayName(timerState.mode)}
          </div>
          <div className="text-sm text-gray-500">
            {timerState.isRunning ? 'Running' : 'Paused'}
          </div>
        </div>
      </div>

      {/* Mode Selection Buttons */}
      <div className="flex justify-center gap-2 mb-8">
        {['focus', 'shortBreak', 'longBreak'].map((mode) => {
          const isActive = timerState.mode === mode;
          const modeLabels = {
            focus: 'Focus',
            shortBreak: 'Short Break', 
            longBreak: 'Long Break'
          };
          
          return (
            <button
              key={mode}
              onClick={() => canControl && onModeChange && onModeChange(mode)}
              disabled={!canControl || timerState.isRunning}
              className={`px-6 py-3 text-sm font-medium rounded-lg transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${
                !canControl || timerState.isRunning 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer'
              }`}
            >
              {modeLabels[mode]}
            </button>
          );
        })}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        {/* Start/Pause Button */}
        <button
          onClick={timerState.isRunning ? onPause : onStart}
          disabled={!canControl}
          className={`flex items-center justify-center px-8 py-3 rounded-lg text-white font-medium transition-all ${
            canControl 
              ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {timerState.isRunning ? (
            <>
              <HiPause size={20} className="mr-2" />
              Pause
            </>
          ) : (
            <>
              <HiPlay size={20} className="mr-2" />
              Start
            </>
          )}
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          disabled={!canControl}
          className={`flex items-center justify-center px-6 py-3 rounded-lg border-2 font-medium transition-all ${
            canControl
              ? 'border-blue-600 text-blue-600 hover:bg-blue-50'
              : 'border-gray-300 text-gray-400 cursor-not-allowed'
          }`}
        >
          <HiArrowPath size={20} className="mr-2" />
          Reset
        </button>
      </div>

      {/* Additional Info */}
      {!canControl && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Only the host can control the timer
          </p>
        </div>
      )}
    </div>
  );
};

export default Timer;
