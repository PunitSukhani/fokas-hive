import React from 'react';
import { HiClock, HiPlay, HiPause, HiStop, HiRefresh } from 'react-icons/hi';

/**
 * Timer Component for Study Rooms
 * Displays and controls the Pomodoro-style timer
 */
const Timer = ({ 
  timerState,
  onStart,
  onPause, 
  onReset,
  onModeChange,
  canControl = false,
  className = ""
}) => {
  const {
    formattedTime,
    modeDisplayName,
    isRunning,
    mode,
    progress,
    cycleCount
  } = timerState;

  // Mode switching handler
  const handleModeChange = (newMode) => {
    if (canControl && onModeChange) {
      onModeChange(newMode);
    }
  };

  // Get mode-specific colors
  const getModeColors = (timerMode) => {
    const colors = {
      focus: {
        primary: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700',
        progress: 'stroke-blue-600'
      },
      shortBreak: {
        primary: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        button: 'bg-green-600 hover:bg-green-700',
        progress: 'stroke-green-600'
      },
      longBreak: {
        primary: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        button: 'bg-purple-600 hover:bg-purple-700',
        progress: 'stroke-purple-600'
      }
    };
    return colors[timerMode] || colors.focus;
  };

  const colors = getModeColors(mode);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-50 p-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <HiClock size={24} />
          Study Timer
        </h2>
        
        {/* Cycle Count */}
        {cycleCount > 0 && (
          <div className="text-sm text-slate-500">
            Cycle {cycleCount}
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className="text-center mb-8">
        {/* Circular Progress */}
        <div className="relative inline-block mb-6">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className={`transition-all duration-1000 ${colors.progress}`}
            />
          </svg>
          
          {/* Time Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-4xl font-bold ${colors.primary} mb-2`}>
                {formattedTime}
              </div>
              <div className="text-sm text-slate-500 capitalize">
                {modeDisplayName}
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mb-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            isRunning 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            {isRunning ? 'Running' : 'Paused'}
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-700 mb-3">Timer Mode</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'focus', label: 'Focus', duration: '25m' },
            { key: 'shortBreak', label: 'Short Break', duration: '5m' },
            { key: 'longBreak', label: 'Long Break', duration: '15m' }
          ].map((modeOption) => (
            <button
              key={modeOption.key}
              onClick={() => handleModeChange(modeOption.key)}
              disabled={!canControl}
              className={`p-3 rounded-lg text-sm font-medium transition-all ${
                mode === modeOption.key
                  ? `${colors.bg} ${colors.primary} ${colors.border} border-2`
                  : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
              } ${
                canControl 
                  ? 'cursor-pointer' 
                  : 'cursor-not-allowed opacity-50'
              }`}
            >
              <div>{modeOption.label}</div>
              <div className="text-xs opacity-75">{modeOption.duration}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3">
        {!isRunning ? (
          <button
            onClick={onStart}
            disabled={!canControl}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all ${
              canControl 
                ? `${colors.button} transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg`
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <HiPlay size={20} />
            Start
          </button>
        ) : (
          <button
            onClick={onPause}
            disabled={!canControl}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all ${
              canControl 
                ? 'bg-yellow-600 hover:bg-yellow-700 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <HiPause size={20} />
            Pause
          </button>
        )}
        
        <button
          onClick={onReset}
          disabled={!canControl}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all ${
            canControl 
              ? 'bg-red-600 hover:bg-red-700 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <HiRefresh size={20} />
          Reset
        </button>
      </div>

      {/* Permission Notice */}
      {!canControl && (
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-500">
            Only the room host can control the timer
          </p>
        </div>
      )}

      {/* Timer Tips */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
        <h4 className="text-sm font-medium text-slate-700 mb-2">Pomodoro Technique</h4>
        <div className="text-xs text-slate-600 space-y-1">
          <p>• 25 min focus → 5 min short break</p>
          <p>• After 4 focus sessions → 15 min long break</p>
          <p>• Stay focused during work sessions</p>
        </div>
      </div>
    </div>
  );
};

export default Timer;
