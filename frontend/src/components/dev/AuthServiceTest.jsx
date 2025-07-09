import React, { useState } from 'react';
import { login, register, logout, verifyToken, getCurrentUser } from '../../services/authService';

/**
 * Auth Service Test Component - for development testing only
 * This component should be accessible only in development mode
 */
const AuthServiceTest = () => {
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Result states
  const [loginResult, setLoginResult] = useState(null);
  const [registerResult, setRegisterResult] = useState(null);
  const [logoutResult, setLogoutResult] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [profileResult, setProfileResult] = useState(null);
  const [serverCheckResult, setServerCheckResult] = useState(null);

  // Test login
  const handleTestLogin = async (e) => {
    e.preventDefault();
    setLoginResult({ status: 'loading' });
    
    try {
      const result = await login(email, password);
      setLoginResult({ status: 'complete', data: result });
      
      // If login successful, also test token verification
      if (result.success) {
        handleTestVerifyToken();
      }
    } catch (error) {
      setLoginResult({ status: 'error', error });
    }
  };

  // Test registration
  const handleTestRegister = async (e) => {
    e.preventDefault();
    setRegisterResult({ status: 'loading' });
    
    try {
      const result = await register({ name, email, password });
      setRegisterResult({ status: 'complete', data: result });
    } catch (error) {
      setRegisterResult({ status: 'error', error });
    }
  };

  // Test logout
  const handleTestLogout = async () => {
    setLogoutResult({ status: 'loading' });
    
    try {
      const result = await logout();
      setLogoutResult({ status: 'complete', data: result });
      
      // Clear other test results
      setLoginResult(null);
      setProfileResult(null);
      setVerifyResult(null);
    } catch (error) {
      setLogoutResult({ status: 'error', error });
    }
  };

  // Test token verification
  const handleTestVerifyToken = async () => {
    setVerifyResult({ status: 'loading' });
    
    try {
      const result = await verifyToken();
      setVerifyResult({ status: 'complete', data: result });
    } catch (error) {
      setVerifyResult({ status: 'error', error });
    }
  };

  // Test fetching profile with authenticated request
  const handleTestProfile = async () => {
    setProfileResult({ status: 'loading' });
    
    try {
      const result = await getCurrentUser();
      setProfileResult({ status: 'complete', data: result });
    } catch (error) {
      setProfileResult({ status: 'error', error });
    }
  };

  // Test server connection
  const checkServerConnection = async () => {
    setServerCheckResult({ status: 'loading' });
    try {
      // Try direct endpoint for base server check with credentials
      const response1 = await fetch('http://localhost:5000/', {
        method: 'GET',
        credentials: 'include',
      });
      
      // Also test API endpoint with credentials
      const response2 = await fetch('http://localhost:5000/api', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      }).catch(e => ({ ok: false, status: 'Error', error: e.message }));

      setServerCheckResult({ 
        status: 'complete', 
        data: { 
          rootEndpoint: {
            success: response1.ok,
            status: response1.status,
            statusText: response1.statusText,
            body: await response1.text().catch(() => 'Could not read body')
          },
          apiEndpoint: response2.ok ? {
            success: response2.ok,
            status: response2.status,
            statusText: response2.statusText,
            body: await response2.text().catch(() => 'Could not read body')
          } : {
            success: false,
            error: response2.error || 'Failed to connect'
          }
        }
      });
    } catch (error) {
      setServerCheckResult({ 
        status: 'error', 
        error: { 
          message: error.message,
          name: error.name,
          cors: error.message.includes('CORS') ? 
            'CORS error - Backend server needs to allow requests from http://localhost:5173' : 
            'Not a CORS issue'
        }
      });
    }
  };

  // Display a formatted JSON object
  const formatJson = (data) => {
    return (
      <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-auto max-h-64">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Auth Service Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Register</h2>
          <form onSubmit={handleTestRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Test Register
            </button>
          </form>
          
          {registerResult && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Result:</h3>
              {registerResult.status === 'loading' ? (
                <p>Loading...</p>
              ) : registerResult.status === 'error' ? (
                <p className="text-red-600">Error: {registerResult.error.message}</p>
              ) : (
                formatJson(registerResult.data)
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Login</h2>
          <form onSubmit={handleTestLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Test Login
            </button>
          </form>
          
          {loginResult && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Result:</h3>
              {loginResult.status === 'loading' ? (
                <p>Loading...</p>
              ) : loginResult.status === 'error' ? (
                <p className="text-red-600">Error: {loginResult.error.message}</p>
              ) : (
                formatJson(loginResult.data)
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Authenticated Actions</h2>
          <div className="space-y-4">
            <button
              onClick={handleTestVerifyToken}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Test Verify Token
            </button>
            
            <button
              onClick={handleTestProfile}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
            >
              Test Get Profile
            </button>
            
            <button
              onClick={handleTestLogout}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Test Logout
            </button>
          </div>
          
          {verifyResult && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Verify Result:</h3>
              {verifyResult.status === 'loading' ? (
                <p>Loading...</p>
              ) : verifyResult.status === 'error' ? (
                <p className="text-red-600">Error: {verifyResult.error.message}</p>
              ) : (
                formatJson(verifyResult.data)
              )}
            </div>
          )}
          
          {profileResult && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Profile Result:</h3>
              {profileResult.status === 'loading' ? (
                <p>Loading...</p>
              ) : profileResult.status === 'error' ? (
                <p className="text-red-600">Error: {profileResult.error.message}</p>
              ) : (
                formatJson(profileResult.data)
              )}
            </div>
          )}
          
          {logoutResult && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Logout Result:</h3>
              {logoutResult.status === 'loading' ? (
                <p>Loading...</p>
              ) : logoutResult.status === 'error' ? (
                <p className="text-red-600">Error: {logoutResult.error.message}</p>
              ) : (
                formatJson(logoutResult.data)
              )}
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Refresh Page
            </button>
            
            <button
              onClick={checkServerConnection}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Check Server Connection
            </button>
            
            <div>
              <h3 className="font-medium mb-2">Cookie Authentication Status:</h3>
              {formatJson({
                loginStatus: loginResult ? loginResult.status : 'not tested',
                verifyStatus: verifyResult ? verifyResult.status : 'not tested',
                profileStatus: profileResult ? profileResult.status : 'not tested',
                logoutStatus: logoutResult ? logoutResult.status : 'not tested'
              })}
            </div>
            
            {serverCheckResult && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Server Connection Check:</h3>
                {serverCheckResult.status === 'loading' ? (
                  <p>Checking connection...</p>
                ) : serverCheckResult.status === 'error' ? (
                  <div>
                    <p className="text-red-600">Connection Error: {serverCheckResult.error.message}</p>
                    {formatJson(serverCheckResult.error)}
                  </div>
                ) : (
                  formatJson(serverCheckResult.data)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthServiceTest;
