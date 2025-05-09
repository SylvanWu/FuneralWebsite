// ✅ RegisterPage.tsx
import React, { useEffect, useState } from 'react';
import { registerUser } from '../api';
import { useNavigate } from 'react-router-dom';
import { isValidPhoneNumber } from 'libphonenumber-js';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPwd] = useState('');
  const [role, setRole] = useState<'visitor' | 'organizer'>('visitor');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      nav('/'); // 登录状态下禁止访问 register
    }
  }, []);

  const isEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  const isPhone = (str: string) => isValidPhoneNumber(str);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // 前端校验
    if (!name.trim()) {
      setError('Username is required');
      return;
    }
    if (!contact.trim()) {
      setError('Phone number or email is required');
      return;
    }
    if (!isEmail(contact) && !isValidPhoneNumber(contact)) {
      setError('Please enter a valid phone number (international format, e.g. +64...) or email');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    let phone = '';
    let email = '';
    if (isEmail(contact)) {
      email = contact;
    } else if (isPhone(contact)) {
      phone = contact;
    }
    try {
      const { user, token } = await registerUser({
        username: name,
        password,
        role,
        phone,
        email,
      });
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      setSuccess(true);
      setTimeout(() => nav('/login'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

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
      {/* ✅ Login 按钮 */}
      <button
        onClick={() => nav('/login')}
        className="absolute top-4 right-4 px-4 py-2 rounded bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 z-50"
      >
        Login
      </button>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-8 m-8 z-40">
        <h1 className="text-3xl font-bold text-center mb-6">Register</h1>

        {error && <p className="mb-4 text-red-600 text-center">{error}</p>}
        {success && <p className="mb-4 text-green-600 text-center">Success! Redirecting…</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            className="w-full md:w-1/3 mx-auto px-3 py-2 border rounded placeholder-gray-500/80"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Username"
          />

          <input
            className="w-full md:w-1/3 mx-auto px-3 py-2 border rounded placeholder-gray-500/80"
            value={contact}
            onChange={e => setContact(e.target.value)}
            required
            placeholder="Phone Number / Email"
          />

          <input
            type="password"
            className="w-full md:w-1/3 mx-auto px-3 py-2 border rounded placeholder-gray-500/80"
            value={password}
            onChange={e => setPwd(e.target.value)}
            required
            placeholder="Password (min 8 chars)"
          />

          <div className="w-full md:w-1/3 mx-auto">
            <label className="block mb-2 text-sm text-center">Select Role</label>
            <div className="flex flex-col items-start gap-4">
              {[
                { label: 'Visitor', value: 'visitor' },
                { label: 'Organizer', value: 'organizer' },
              ].map(({ label, value }) => (
                <label key={value} className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    checked={role === value}
                    onChange={() => setRole(value as any)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

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
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
