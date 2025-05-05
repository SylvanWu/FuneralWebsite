// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { registerUser } from '../api';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('visitor');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerUser({ username, password, role });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <main className="w-full max-w-md mx-auto mt-20 p-6 bg-white shadow rounded overflow-hidden">
      <h1 className="text-2xl mb-4 font-semibold text-center">Register</h1>

      {error   && <div className="mb-3 text-red-600">{error}</div>}
      {success && <div className="mb-3 text-green-600">Registration successful! Redirecting…</div>}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* -------- Username -------- */}
        <div>
          <label className="block mb-1">Username</label>
          <input
            className="w-full px-3 py-2 border rounded"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>

        {/* -------- Password -------- */}
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        {/* -------- Role -------- */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Role</label>

          {[
            { label: 'Visitor', value: 'visitor', disabled: false },
            { label: 'Organizer', value: 'organizer', disabled: false },
            { label: 'Admin',    value: 'admin',    disabled: false },
            { label: 'Remembered Person (System Only)', value: 'remembered person', disabled: true },
          ].map(({ label, value, disabled }) => (
            <div
              key={value}
              className={`grid grid-cols-[auto,1fr] gap-2 mb-1 ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <input
                type="radio"
                name="role"
                value={value}
                checked={role === value}
                onChange={() => !disabled && setRole(value)}
                disabled={disabled}
              />
              <span className="break-words text-sm">{label}</span>
            </div>
          ))}
        </div>

        {/* -------- Submit -------- */}
        <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Register
        </button>
      </form>
    </main>
  );
}
