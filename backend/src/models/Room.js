import mongoose from 'mongoose';

/**
 * Room Schema
 * Represents a virtual room where users can join to study together
 * with synchronized timers and real-time chat functionality
 */
const roomSchema = new mongoose.Schema({
  // Room name - must be unique across all rooms
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  // User who created and hosts the room
  host: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // Customizable timer durations for different modes
  timerSettings: {
    focusDuration: {
      type: Number,
      default: 25 * 60, // 25 minutes in seconds
      min: 1 * 60, // Minimum 1 minute
      max: 180 * 60 // Maximum 3 hours
    },
    shortBreakDuration: {
      type: Number,
      default: 5 * 60, // 5 minutes in seconds
      min: 1 * 60, // Minimum 1 minute
      max: 60 * 60 // Maximum 1 hour
    },
    longBreakDuration: {
      type: Number,
      default: 15 * 60, // 15 minutes in seconds
      min: 1 * 60, // Minimum 1 minute
      max: 180 * 60 // Maximum 3 hours
    }
  },
  // Current state of the room's shared timer
  timerState: {
    // Current timer mode (focus work period, short break, or long break)
    mode: { 
      type: String, 
      enum: ['focus', 'shortBreak', 'longBreak'], 
      default: 'focus' 
    },
    // Remaining time in seconds for current timer session
    timeRemaining: { 
      type: Number, 
      default: 25 * 60 // 25 minutes in seconds
    },
    // Whether the timer is currently running or paused
    isRunning: { 
      type: Boolean, 
      default: false 
    },
    // Number of completed focus/break cycles (for Pomodoro tracking)
    cycleCount: { 
      type: Number, 
      default: 0 
    },
    // Timestamp when timer was started (for calculating elapsed time)
    startedAt: {
      type: Date,
      default: null
    },
    // Timestamp when timer was paused (for pause duration tracking)
    pausedAt: {
      type: Date,
      default: null
    }
  },
  // Room creation timestamp
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  // Array of users currently in the room
  users: [{
    // Reference to User document
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    // Cached user name for quick access
    name: String,
    // Socket.io connection ID for real-time updates
    socketId: String,
    // When the user joined this room
    joinedAt: { 
      type: Date, 
      default: Date.now 
    }
  }]
});

export default mongoose.model('Room', roomSchema);
