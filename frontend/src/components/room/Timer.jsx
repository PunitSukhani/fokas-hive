import React from 'react';
import { HiPlay, HiPause } from 'react-icons/hi';
import { HiArrowPath } from 'react-icons/hi2';

/**
 * Timer Component
 * 
 * A Pomodoro-style timer for study sessions with visual progress indicator.
 * Features a circular progress bar, mode selection (focus/breaks), and control buttons.
 * Only the room host can control the timer, but all users see synchronized updates.
 * 
 * @param {Object} timerState - Current timer state from useTimer hook
 * @param {Function} onStart - Function to start the timer
 * @param {Function} onPause - Function to pause the timer  
 * @param {Function} onReset - Function to reset the timer
 * @param {Function} onModeChange - Function to change timer mode
 * @param {boolean} canControl - Whether current user can control timer (host only)
 * @param {string} className - Additional CSS classes
 * @param {Object} room - Room data with timer settings
 */
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
  /**
   * Format seconds into MM:SS display format
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string (e.g., "25:00")
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Calculate progress percentage for circular progress bar
   * Uses progress value from the timer hook
   * @returns {number} Progress percentage (0-100)
   */
  const getProgress = () => {
    // The timerState passed is actually the entire timerHook object
    return timerState.progress || 0;
  };

  /**
   * Get user-friendly display name for timer mode
   * @param {string} mode - Timer mode ('focus', 'shortBreak', 'longBreak')
   * @returns {string} Display name for the mode
   */
  const getModeDisplayName = (mode) => {
    switch (mode) {
      case 'focus': return 'Focus Session';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
      default: return 'Focus Session';
    }
  };

  /**
   * Get timer duration for a specific mode from room settings
   * @param {string} mode - Timer mode
   * @returns {number} Duration in minutes
   */
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

  /**
   * Get color theme for different timer modes
   * @param {string} mode - Timer mode
   * @returns {string} CSS color value
   */
  const getModeColor = (mode) => {
    switch (mode) {
      case 'focus': return '#3B82F6'; // Blue
      case 'shortBreak': return '#10B981'; // Green
      case 'longBreak': return '#F59E0B'; // Orange
      default: return '#3B82F6';
    }
  };

  const progress = getProgress();
  const progressColor = getModeColor(timerState.mode);

  return (
    <div className={`bg-white rounded-xl border border-gray-100 max-w-full mx-auto h-full flex flex-col justify-center ${className}`}>
      {/* Circular Timer Display - Made Larger for Prominence */}
      <div className="relative flex items-center justify-center mb-8">
        <svg className="transform -rotate-90 w-72 h-72">
          {/* Background circle */}
          <circle
            cx="144"
            cy="144"
            r="128"
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="144"
            cy="144"
            r="128"
            stroke={progressColor}
            strokeWidth="8"
            fill="none"
            strokeDasharray={804.25}
            strokeDashoffset={804.25 - (progress / 100) * 804.25}
            style={{ 
              transition: 'stroke-dashoffset 0.5s ease-in-out',
              filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))'
            }}
          />
        </svg>
        
        {/* Timer Display - Enhanced for Focus */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-6xl font-bold mb-3" style={{ color: progressColor }}>
            {formatTime(timerState.timeRemaining || 0)}
          </div>
          <div className="text-xl text-gray-600 mb-2">
            {getModeDisplayName(timerState.mode)}
          </div>
          <div className="text-lg text-gray-500">
            {timerState.isRunning ? 'Running' : 'Paused'}
          </div>
        </div>
      </div>

      {/* Mode Selection Buttons - With Duration Display */}
      <div className="flex justify-center gap-4 mb-8">
        {['focus', 'shortBreak', 'longBreak'].map((mode) => {
          const isActive = timerState.mode === mode;
          const modeLabels = {
            focus: 'Focus',
            shortBreak: 'Short Break', 
            longBreak: 'Long Break'
          };
          const duration = getModeDuration(mode);
          const modeColor = getModeColor(mode);
          
          return (
            <button
              key={mode}
              onClick={() => canControl && onModeChange && onModeChange(mode)}
              disabled={!canControl || timerState.isRunning}
              className={`px-6 py-4 text-sm font-medium rounded-xl transition-all flex flex-col items-center min-w-[100px] border-2 ${
                isActive 
                  ? 'text-white shadow-lg scale-105 border-transparent' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${
                !canControl || timerState.isRunning 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer'
              }`}
              style={isActive ? { backgroundColor: modeColor } : {}}
            >
              <span className="text-sm font-medium">{modeLabels[mode]}</span>
              <span className="text-lg font-bold">{duration}m</span>
            </button>
          );
        })}
      </div>

      {/* Control Buttons - Enhanced Size and Styling */}
      <div className="flex justify-center gap-6 mb-6">
        {/* Start/Pause Button */}
        <button
          onClick={timerState.isRunning ? onPause : onStart}
          disabled={!canControl}
          className={`flex items-center justify-center px-10 py-4 rounded-xl text-white font-medium transition-all text-xl ${
            canControl 
              ? 'hover:shadow-lg hover:scale-105' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          style={canControl ? { backgroundColor: progressColor } : {}}
        >
          {timerState.isRunning ? (
            <>
              <HiPause size={24} className="mr-3" />
              Pause
            </>
          ) : (
            <>
              <HiPlay size={24} className="mr-3" />
              Start
            </>
          )}
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          disabled={!canControl}
          className={`flex items-center justify-center px-8 py-4 rounded-xl border-2 font-medium transition-all text-lg ${
            canControl
              ? 'hover:bg-gray-50 hover:scale-105'
              : 'border-gray-300 text-gray-400 cursor-not-allowed'
          }`}
          style={canControl ? { borderColor: progressColor, color: progressColor } : {}}
        >
          <HiArrowPath size={20} className="mr-2" />
          Reset
        </button>
      </div>

      {/* Additional Info */}
      {!canControl && (
        <div className="text-center">
          <p className="text-sm text-gray-500 bg-gray-50 rounded-lg py-3 px-4">
            Only the host can control the timer
          </p>
        </div>
      )}
    </div>
  );
};

export default Timer;
