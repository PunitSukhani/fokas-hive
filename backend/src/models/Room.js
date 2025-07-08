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
