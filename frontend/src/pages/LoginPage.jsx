import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { HiExclamationCircle, HiMail, HiLockClosed, HiArrowLeft } from 'react-icons/hi';
import { ImSpinner8 } from 'react-icons/im';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  
  useEffect(() => {
    // Focus email input when component mounts
    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // Use the authService to handle login
      const result = await login(email, password);
      
      if (result.success) {
        // Update auth context with user data
        authLogin(result.user);
        // Show success toast
        toast.success('Login successful!');
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        // Display specific error message from backend or a default message
        const errorMsg = result.error || 'Invalid email or password. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      // For unexpected errors (network issues, etc.)
      const errorMsg = 'Unable to connect to the server. Please check your internet connection and try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <span className="text-4xl font-bold text-blue-600">Fokas<span className="text-slate-800">Hive</span></span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6 rounded-lg shadow-sm animate-fadeIn">
            <div className="flex items-center">
              <HiExclamationCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiMail className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400 transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
              </div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiLockClosed className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <ImSpinner8 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Signing in...
                  </span>
                ) : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-base text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
        
        <div className="mt-4 text-center">
          <Link to="/" className="inline-flex items-center text-sm text-slate-600 hover:text-blue-600 transition-colors group">
            <HiArrowLeft className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
