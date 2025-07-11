import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/roomRoutes.js';
import setupSocketHandlers from './socket/socketHandlers.js';
import { setSocketInstance } from './utils/socketInstance.js';
import Room from './models/Room.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['websocket', 'polling'] // Support both transport methods
});

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',  // Default React port
      'http://localhost:5173',  // Vite default port
      'http://127.0.0.1:5173'   // Also allow Vite on IP address
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.CLIENT_URL === origin) {
      callback(null, true);
    } else {
      console.log(`Origin ${origin} not allowed by CORS`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.send('StudyRoom API is running');
});



// Log critical Socket.IO connection errors
io.engine.on("connection_error", (err) => {
  console.error("Socket.IO connection error:", err.code, err.message);
});

// Setup connection debugging before handler registration
io.on("new_namespace", (namespace) => {
  console.log("� New namespace created:", namespace.name);
});

io.engine.on("headers", (headers, req) => {
  console.log("� Headers event for request:", req.url);
});

io.engine.on("initial_headers", (headers, req) => {
  console.log("� Initial headers for request:", req.url);
});

// Setup Socket.IO handlers
setSocketInstance(io);
setupSocketHandlers(io);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    
    // Setup automatic cleanup of empty rooms every 15 minutes
    const cleanupInterval = setInterval(async () => {
      try {
        const emptyRooms = await Room.find({ 
          $or: [
            { users: { $size: 0 } },
            { users: { $exists: false } }
          ]
        });
        
        if (emptyRooms.length > 0) {
          console.log(`[AUTO-CLEANUP] Found ${emptyRooms.length} empty rooms to delete`);
          
          for (const room of emptyRooms) {
            console.log(`[AUTO-CLEANUP] Deleting empty room: ${room.name} (${room._id})`);
            await Room.findByIdAndDelete(room._id);
          }
          
          console.log(`[AUTO-CLEANUP] Deleted ${emptyRooms.length} empty rooms`);
        }
      } catch (error) {
        console.error('[AUTO-CLEANUP] Error during automatic cleanup:', error);
      }
    }, 15 * 60 * 1000); // Run every 15 minutes
    
    // Cleanup interval reference for graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      clearInterval(cleanupInterval);
      process.exit(0);
    });
    
    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      clearInterval(cleanupInterval);
      process.exit(0);
    });
    
    const PORT = process.env.PORT || 5000; // Using port 5000
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
