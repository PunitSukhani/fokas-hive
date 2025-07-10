import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  host: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
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
  timerState: {
    mode: { 
      type: String, 
      enum: ['focus', 'shortBreak', 'longBreak'], 
      default: 'focus' 
    },
    timeRemaining: { 
      type: Number, 
      default: 25 * 60 // 25 minutes in seconds
    },
    isRunning: { 
      type: Boolean, 
      default: false 
    },
    cycleCount: { 
      type: Number, 
      default: 0 
    },
    startedAt: {
      type: Date,
      default: null
    },
    pausedAt: {
      type: Date,
      default: null
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  users: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    name: String,
    socketId: String,
    joinedAt: { 
      type: Date, 
      default: Date.now 
    }
  }]
});

export default mongoose.model('Room', roomSchema);
