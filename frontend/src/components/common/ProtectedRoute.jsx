import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * A wrapper for routes that require authentication
 * Redirects to login page if user is not authenticated
 */
const ProtectedRoute = () => {
  const { isLoggedIn, loading } = useAuth();
  
  // Show nothing while checking authentication status
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  // Redirect to login page if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // Render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
