// ✅ LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api';
import API from '../api';

interface LoginPageProps {
  setToken: (token: string) => void;
}

export default function LoginPage({ setToken }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Username and password are required');
      return;
    }
    try {
      const { user, token } = await loginUser({ username, password });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      API.defaults.headers.common.Authorization = `Bearer ${token}`;
      setToken(token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  // useEffect(() => {
  //   if (localStorage.getItem('token')) {
  //     navigate('/');
  //   }
  // }, [navigate]);

  console.log('HomePage loaded');

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center"
      style={{
        backgroundImage: "url('/1.jpg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="w-full md:w-1/2 bg-white/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-10 transition-all duration-300 ease-in-out" 
           style={{ maxWidth: '550px', minWidth: '320px',backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(16px)',                   
            WebkitBackdropFilter: 'blur(16px)',            
            borderRadius: '16px',                            
            overflow: 'hidden',                              
           }}>
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800"
        style={{ paddingBottom: '2vh'}}>Sign In</h1>

        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center font-medium"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            {/* <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label> */}
            <input
              id="username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            {/* <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label> */}
            <input
              id="password"
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            style={{ backgroundColor: 'rgba(54, 53, 53, 0.5)'}}
          >
            Sign In
          </button>
        </form>

        <p className="mt-8 text-sm text-center text-gray-600"
        style={{ paddingTop: '1vh'}}>
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-green-600 hover:text-green-800 font-medium"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
