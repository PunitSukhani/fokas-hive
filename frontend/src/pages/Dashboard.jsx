import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HiBell, 
  HiPlusSm, 
  HiClock, 
  HiUserGroup, 
  HiCalendar,
  HiChevronRight
} from 'react-icons/hi';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser: user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <span className="text-xl font-bold text-blue-600">Study<span className="text-slate-800">Room</span></span>
              </Link>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link 
                  to="/dashboard" 
                  className="border-b-2 border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/rooms" 
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Study Rooms
                </Link>
                <Link 
                  to="/timer" 
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Focus Timer
                </Link>
                <Link 
                  to="/resources" 
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Resources
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-4 flex items-center md:ml-6">
                <button className="bg-gray-100 p-1 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <span className="sr-only">View notifications</span>
                  <HiBell className="h-6 w-6" />
                </button>

                {/* Profile dropdown */}
                <div className="ml-3 relative">
                  <div>
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </button>
                  </div>
                  
                  {/* Dropdown menu */}
                  {isDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link 
                        to="/settings" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="px-6 py-8 sm:p-10 sm:pb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Welcome back, {user?.name || 'Student'}</h2>
                <span className="px-4 py-1 rounded-full text-xs font-medium bg-blue-800 text-blue-100">
                  Pro Member
                </span>
              </div>
              <div className="mt-3 max-w-xl text-sm text-blue-100">
                <p>Track your study progress, join rooms, and boost your productivity today.</p>
              </div>
            </div>
            <div className="px-6 pt-2 pb-8 bg-blue-700 bg-opacity-20 sm:p-10 sm:pt-6">
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-white font-medium mr-2">Study streak:</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-3 w-3 rounded-full mx-0.5 ${idx < 3 ? 'bg-green-400' : 'bg-blue-200 bg-opacity-30'}`}
                      ></div>
                    ))}
                  </div>
                  <span className="ml-2 text-white text-sm">3 days</span>
                </div>
                <Link 
                  to="/rooms/join" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                >
                  Join a Room
                </Link>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['overview', 'activity', 'stats', 'calendar'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm capitalize`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column - Cards */}
            <div className="md:col-span-2 space-y-6">
              {/* Study Rooms Card */}
              <div className="bg-white rounded-xl shadow-md p-6 transition-shadow hover:shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Your Study Rooms</h2>
                  <Link 
                    to="/rooms/create" 
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    <HiPlusSm className="h-5 w-5 mr-1" />
                    Create Room
                  </Link>
                </div>
                
                <div className="divide-y divide-gray-200">
                  <div className="py-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Advanced Mathematics</h3>
                      <p className="text-sm text-gray-500">5 members • Active now</p>
                    </div>
                    <Link 
                      to="/rooms/123" 
                      className="px-4 py-2 border border-blue-600 rounded-lg text-blue-600 text-sm font-medium hover:bg-blue-50"
                    >
                      Join
                    </Link>
                  </div>
                  
                  <div className="py-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Programming Group</h3>
                      <p className="text-sm text-gray-500">8 members • Last active: 2h ago</p>
                    </div>
                    <Link 
                      to="/rooms/456" 
                      className="px-4 py-2 border border-blue-600 rounded-lg text-blue-600 text-sm font-medium hover:bg-blue-50"
                    >
                      Join
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Focus Timer Card */}
              <div className="bg-white rounded-xl shadow-md p-6 transition-shadow hover:shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Focus Timer</h2>
                
                <div className="flex items-center justify-center my-6">
                  <div className="relative h-40 w-40 rounded-full border-4 border-blue-100 flex items-center justify-center">
                    <svg className="absolute top-0 left-0 h-full w-full" viewBox="0 0 100 100">
                      <circle 
                        cx="50" cy="50" r="48" 
                        fill="none" 
                        stroke="#dbeafe" 
                        strokeWidth="4"
                      />
                      <circle 
                        cx="50" cy="50" r="48" 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="4"
                        strokeDasharray="301.59"
                        strokeDashoffset="75"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800">25:00</div>
                      <div className="text-sm text-gray-500">minutes</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4 mt-6">
                  <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Start Focus Session
                  </button>
                  <button className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Settings
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right column - Activity & Stats */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-md p-6 transition-shadow hover:shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                  <Link 
                    to="/activity" 
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    View all
                  </Link>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <HiClock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">Completed a 25 min focus session</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-green-100 h-8 w-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <HiUserGroup className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">Joined "Advanced Mathematics" study room</p>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-purple-100 h-8 w-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <HiCalendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">Set a study goal: 20 hours this week</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="bg-white rounded-xl shadow-md p-6 transition-shadow hover:shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Study Stats</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Weekly Goal</span>
                      <span className="text-sm font-medium text-gray-700">12/20 hours</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">12</div>
                        <div className="text-xs text-gray-500">hours studied</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">8</div>
                        <div className="text-xs text-gray-500">sessions completed</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Profile Card */}
              <div className="bg-white rounded-xl shadow-md p-6 transition-shadow hover:shadow-lg border border-gray-100">
                <Link to="/profile" className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3">
                    {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                  </div>
                  <HiChevronRight className="ml-auto h-5 w-5 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
