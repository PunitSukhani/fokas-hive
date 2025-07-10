import React from 'react';
import { HiOutlineX, HiClock } from 'react-icons/hi';

const CreateRoomModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  roomName, 
  onRoomNameChange,
  focusDuration = 25,
  shortBreakDuration = 5,
  longBreakDuration = 15,
  onFocusDurationChange,
  onShortBreakDurationChange,
  onLongBreakDurationChange,
  isConnected = true 
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Create a New Room</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <HiOutlineX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-slate-700 mb-1">
              Room Name
            </label>
            <input
              id="roomName"
              type="text"
              value={roomName}
              onChange={onRoomNameChange}
              placeholder="Enter a name for your study room"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={!isConnected}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <HiClock className="text-blue-500" size={20} />
              <h3 className="text-sm font-medium text-slate-700">Timer Settings (minutes)</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="focusDuration" className="block text-xs font-medium text-slate-600 mb-1">
                  Focus Session
                </label>
                <input
                  id="focusDuration"
                  type="number"
                  min="1"
                  max="180"
                  value={focusDuration}
                  onChange={onFocusDurationChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={!isConnected}
                />
              </div>
              
              <div>
                <label htmlFor="shortBreakDuration" className="block text-xs font-medium text-slate-600 mb-1">
                  Short Break
                </label>
                <input
                  id="shortBreakDuration"
                  type="number"
                  min="1"
                  max="60"
                  value={shortBreakDuration}
                  onChange={onShortBreakDurationChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={!isConnected}
                />
              </div>
              
              <div>
                <label htmlFor="longBreakDuration" className="block text-xs font-medium text-slate-600 mb-1">
                  Long Break
                </label>
                <input
                  id="longBreakDuration"
                  type="number"
                  min="1"
                  max="180"
                  value={longBreakDuration}
                  onChange={onLongBreakDurationChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={!isConnected}
                />
              </div>
            </div>
            
            <p className="text-xs text-slate-500 mt-2">
              Recommended: 25 min focus, 5 min short break, 15 min long break (Pomodoro Technique)
            </p>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isConnected}
              className={`w-1/2 px-4 py-2 rounded-lg transition-colors ${
                isConnected 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
