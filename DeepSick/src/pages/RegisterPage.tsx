
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { isValidPhoneNumber } from 'libphonenumber-js';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPwd] = useState('');
  const [userType, setUserType] = useState<'organizer' | 'visitor'>('visitor');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      nav('/'); // Prevent access to register page when already logged in
    }
  }, []);

  const isEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  const isPhone = (str: string) => isValidPhoneNumber(str);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Frontend validation
    if (!name.trim()) {
      setError('Username is required');
      return;
    }
    if (!contact.trim()) {
      setError('Phone number or email is required');
      return;
    }
    if (!isEmail(contact) && !isPhone(contact)) {
      setError(
        'Please enter a valid phone number (international format, e.g. +64...) or email'
      );
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
      // Send registration request
      await API.post('/auth/register', {
        username: name,
        password,
        userType,
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {})
      });
      setSuccess(true);
      setTimeout(() => nav('/login'), 1500);
    } catch (err: any) {
      // Handle duplicate username error specifically
      if (err.response?.status === 409) {
        setError('Registration failed: Username already exists');
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    }
  };

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-4 md:p-0"
      style={{
        backgroundImage: "url('/register.png')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Registration card */}
      <div
        className="w-full md:w-1/2 bg-white/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-10 transition-all duration-300 ease-in-out"
        style={{ maxWidth: '550px', minWidth: '320px' }}
      >
        {/* Title */}
        <h1
          className="text-3xl font-bold text-center mb-8 text-gray-800"
          style={{ paddingBottom: '2vh' }}
        >
          <span className="relative inline-block pb-2 after:content-[''] after:absolute after:w-1/2 after:h-0.5 after:bg-indigo-500 after:bottom-0 after:left-1/4">
            Create Account
          </span>
        </h1>

        {/* Error message */}
        {error && (
          <div className="bg-red-50/70 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-center font-medium animate-pulse">
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="bg-green-50/70 backdrop-blur-sm border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-center font-medium">
            <div className="flex items-center justify-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Success! Redirecting…</span>
            </div>
          </div>
        )}

        {/* Registration form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username input */}
          <div className="space-y-2">
            <input
              id="username"
              className="w-full px-4 py-3 border border-gray-300 bg-white/90 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>

          {/* Contact input */}
          <div className="space-y-2">
            <input
              id="contact"
              className="w-full px-4 py-3 border border-gray-300 bg-white/90 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              value={contact}
              onChange={e => setContact(e.target.value)}
              required
              placeholder="Enter your email or phone number"
            />
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <input
              id="password"
              type="password"
              className="w-full px-4 py-3 border border-gray-300 bg-white/90 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              value={password}
              onChange={e => setPwd(e.target.value)}
              required
              placeholder="Min 8 characters"
            />
          </div>

          {/* User type selection */}
          <div className="flex flex-wrap items-center justify-center space-x-4 pt-2">
            {[{ label: 'Visitor', value: 'visitor', icon: '👤' }, { label: 'Organizer', value: 'organizer', icon: '🏢' }].map(({ label, value, icon }) => (
              <label
                key={value}
                className={`inline-flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-lg ${
                  userType === value ? 'text-indigo-700 shadow-md' : 'text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="userType"
                  value={value}
                  checked={userType === value}
                  onChange={() => setUserType(value as any)}
                  className="sr-only"
                />
                <span className="text-xl">{icon}</span>
                <span>{label}</span>
              </label>
            ))}
          </div>

          {/* Submit button + login link */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Create Account
            </button>
            <p className="mt-6 text-sm text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 hover:text-green-800 font-medium">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

