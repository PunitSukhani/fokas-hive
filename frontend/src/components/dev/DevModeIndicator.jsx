import React from 'react';

const DevModeIndicator = () => {
  // Only show in development mode
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-medium shadow-lg z-50">
      <div className="flex items-center space-x-1">
        <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
        <span>DEV MODE</span>
      </div>
    </div>
  );
};

export default DevModeIndicator;
