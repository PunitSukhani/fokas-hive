import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-16">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-9xl font-extrabold text-blue-600 animate-bounce-slow">404</h1>
        <div className="mt-4 mb-8 h-1 w-16 bg-blue-200 mx-auto rounded-full"></div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-xl text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
          >
            Return to Home
          </Link>
          <Link
            to="/login"
            className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
          >
            Sign In
          </Link>
        </div>
        
        <div className="mt-12 relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-sm text-gray-500">Need help?</span>
          </div>
        </div>
        
        <div className="mt-8">
          <p className="text-gray-600 mb-4">Try one of these links instead:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">Dashboard</Link>
            <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">Register</Link>
            <Link to="/support" className="text-blue-600 hover:text-blue-800 font-medium">Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
