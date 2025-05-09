// ✅ LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api';
import API from '../api';

export default function LoginPage({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        backgroundImage: "url('/bg-login.JPG')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-8 m-8 z-40">
        <h1 className="text-3xl font-bold text-center mb-6">Sign In</h1>

        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            className="w-full md:w-1/3 mx-auto px-3 py-2 border rounded placeholder-gray-500/80"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            className="w-full md:w-1/3 mx-auto px-3 py-2 border rounded placeholder-gray-500/80"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full md:w-1/3 mx-auto py-2 bg-lime-500 hover:bg-lime-600 text-white rounded transition"
          >
            Sign In
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
