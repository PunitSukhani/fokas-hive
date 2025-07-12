import React from 'react';
import { Link } from 'react-router-dom';
import { HiUserGroup, HiClock, HiChat } from 'react-icons/hi';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header/Navigation */}
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">
                Fokas<span className="text-slate-800">Hive</span>
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 py-0 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
              The smarter way to <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">study together</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12">
              Connect with peers, share knowledge, and boost your productivity with our collaborative learning platform.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center transform hover:-translate-y-2 border border-blue-50">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <HiUserGroup className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Focus Groups</h3>
              <p className="text-slate-600 text-lg">
                Create or join virtual rooms and collaborate with students worldwide.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center transform hover:-translate-y-2 border border-blue-50">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <HiClock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Focus Timer</h3>
              <p className="text-slate-600 text-lg">
                Boost productivity with our Pomodoro-style study timer.
              </p>

            </div>

            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center transform hover:-translate-y-2 border border-blue-50">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <HiChat className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Real-time Chat</h3>
              <p className="text-slate-600 text-lg">
                Exchange ideas, ask questions, and share resources with your study partners.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
