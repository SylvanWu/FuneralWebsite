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
        backgroundImage: "url('/bg-login.JPG')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-8 m-8 z-40">
        <h1 className="text-3xl font-bold text-center mb-6">Sign In</h1>

        {error && (
          <div
            style={{
              color: '#dc2626',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: 6,
              padding: '8px 0',
              textAlign: 'center',
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            {error}
          </div>
        )}

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
            style={{
              width: '100%',
              padding: '14px 0',
              background: '#4ade80',
              color: '#fff',
              fontSize: 18,
              fontWeight: 700,
              border: 'none',
              borderRadius: 8,
              marginTop: 12,
              marginBottom: 8,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #d1fae5',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={e => (e.target.style.background = '#22c55e')}
            onMouseOut={e => (e.target.style.background = '#4ade80')}
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
