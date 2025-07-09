import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

// Import pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'

// Import auth components
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'

// Development tools - will be removed in production
import AuthServiceTest from './components/dev/AuthServiceTest'
import DevModeIndicator from './components/dev/DevModeIndicator'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background text-gray-900">
          {process.env.NODE_ENV !== 'production' && <DevModeIndicator />}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Add more protected routes here */}
            </Route>
            
            {/* Development Testing Routes */}
            {process.env.NODE_ENV !== 'production' && (
              <Route path="/dev/test-auth" element={<AuthServiceTest />} />
            )}
            
            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App
