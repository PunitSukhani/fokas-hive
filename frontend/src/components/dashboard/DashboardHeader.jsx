import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Dashboard Header Component
 * 
 * Displays the main header for the dashboard page including:
 * - Welcome message with user's name or email
 * - FokasHive title
 * - Logout button with authentication context
 * 
 * Features:
 * - Responsive design that stacks on mobile devices
 * - Displays current user's name (fallback to email)
 * - Clean logout functionality
 * - Consistent styling with the rest of the application
 * 
 * @returns {JSX.Element} Dashboard header with user info and logout
 */
const DashboardHeader = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="flex flex-col md:flex-row items-center justify-between mb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">FokasHive</h1>
        {currentUser && (
          <p className="text-slate-500">
            Welcome back, {currentUser.name || currentUser.email}
          </p>
        )}
      </div>
      
      <div className="mt-4 md:mt-0">
        <button
          onClick={() => logout()}
          className="bg-white text-slate-700 px-4 py-2 rounded-lg shadow hover:shadow-md transition-all border border-slate-200"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
