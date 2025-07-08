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

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['websocket', 'polling'] // Support both transport methods
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
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
setupSocketHandlers(io);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000; // Using port 5000
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
