# FokasHive - Collaborative Online Study Platform

A real-time collaborative study platform that allows users to create and join virtual focus rooms with integrated Pomodoro timers and chat functionality. FokasHive helps students stay focused and productive through synchronized study sessions.

## Features

### 🏠 Focus Rooms
- Create custom focus rooms with personalized settings
- Join existing active rooms
- Real-time user presence and room management
- Automatic cleanup of empty rooms

### ⏱️ Pomodoro Timer
- Customizable timer durations (focus, short break, long break)
- Host-controlled timer for synchronized study sessions
- Visual progress indicators with circular timer display
- Real-time timer synchronization across all room members

### 💬 Real-time Chat
- Instant messaging within focus rooms
- System notifications for user join/leave events
- Message validation and character limits
- Clean, responsive chat interface

### 🔐 Authentication
- Secure user registration and login
- JWT-based authentication with HTTP-only cookies
- Protected routes and session management
- Automatic token refresh and validation

## Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing
- **Heroicons** - Beautiful SVG icons
- **React Toastify** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

## Project Structure

```
fokashive/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── chat/       # Chat-related components
│   │   │   ├── common/     # Shared components
│   │   │   ├── dashboard/  # Dashboard components
│   │   │   └── room/       # Room-specific components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── vite.config.js
│
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── socket/         # Socket.IO handlers
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── index.js
│
└── README.md               # Project documentation
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Room Endpoints

- `POST /api/rooms` - Create new room
- `GET /api/rooms/active` - Get active rooms
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms/:id/join` - Join room

### Socket.IO Events

#### Room Management
- `join-room` - Join a focus room
- `leave-room` - Leave a focus room
- `get-active-rooms` - Request active rooms list
- `room-joined` - Room join confirmation
- `user-list-updated` - Updated room member list

#### Chat System
- `send-message` - Send chat message
- `new-message` - Receive new message
- `user-joined` - User joined notification
- `user-left` - User left notification

#### Timer Control
- `start-timer` - Start room timer (host only)
- `pause-timer` - Pause room timer (host only)
- `reset-timer` - Reset room timer (host only)
- `change-timer-mode` - Change timer mode (host only)
- `timer-started` - Timer state update
- `timer-paused` - Timer paused update
- `timer-reset` - Timer reset update

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (.env):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fokashive
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

4. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)
- `CLIENT_URL` - Frontend URL for CORS

## Usage

1. **Registration/Login**: Create an account or login with existing credentials
2. **Dashboard**: View active focus rooms or create a new one
3. **Room Creation**: Set custom timer durations and room name
4. **Join Room**: Click on any active room to join
5. **Study Session**: Use the synchronized timer and chat with other members
6. **Timer Control**: Only the room host can control the timer

## Development

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

#### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Code Structure

The application follows a modular architecture with clear separation of concerns:

- **Components**: Reusable UI components with proper documentation
- **Hooks**: Custom React hooks for state management and side effects
- **Services**: API communication layer
- **Controllers**: Backend request handlers
- **Socket Handlers**: Real-time event management
- **Models**: Database schemas and validation

### Contributing

1. Follow the existing code style and patterns
2. Add proper JSDoc documentation for new functions
3. Test real-time features thoroughly
4. Ensure responsive design compatibility
5. Update this README for significant changes

## License

This project is created for educational purposes as part of the FokasHive collaborative study platform.