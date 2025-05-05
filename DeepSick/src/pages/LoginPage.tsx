// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate }        from 'react-router-dom';
import { loginUser }          from '../api';
import API                    from '../api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const navigate = useNavigate();

  // ───────── 登录提交 ─────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 后端直接返回 { user, token }
      const { user, token } = await loginUser({ username, password });

      // 存 token & 角色
      localStorage.setItem('token', token);
      localStorage.setItem('role',  user.role);

      // 让 axios 之后自动带上 JWT
      API.defaults.headers.common.Authorization = `Bearer ${token}`;

      // 根据角色跳转
      navigate(user.role === 'admin' ? '/admin' : '/wills');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  // ───────── 视图 ─────────
  return (
    <main className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded">
      <h1 className="text-2xl mb-4 text-center font-semibold">Sign In</h1>

      {error && <div className="mb-3 text-red-600 text-center">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Username</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
        >
          Sign In
        </button>
      </form>

      <p className="mt-4 text-sm text-center">
        Don’t have an account?{' '}
        <a href="/register" className="text-blue-600 hover:underline">
          Register here
        </a>
      </p>
    </main>
  );
}
