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

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsConfig = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://fokas-hive.vercel.app',
      process.env.CLIENT_URL
    ];
    
    if (!origin || 
        allowedOrigins.includes(origin) || 
        (origin.includes('vercel.app') && origin.includes('fokas-hive')) ||
        origin.includes('punit-sukhanis-projects.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
};

// Socket.IO setup
const io = new Server(server, {
  cors: corsConfig,
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors(corsConfig));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);


import path from 'path';
import { fileURLToPath } from 'url';

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend for all non-API GET requests
const frontendPath = path.join(__dirname, '../../frontend/dist/index.html');

app.get('/', (req, res) => {
  res.json({ message: 'FokasHive API is running! 🚀' });
});

app.get(/^\/((?!api).)*$/, (req, res) => {
  res.sendFile(frontendPath);
});

// Socket.IO handlers
setSocketInstance(io);
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
