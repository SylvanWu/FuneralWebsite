// ✅ RegisterPage.tsx
import React, { useEffect, useState } from 'react';
// import { registerUser } from '../api'; // Removed unused import
import { useNavigate, Link } from 'react-router-dom';
// import { isValidPhoneNumber } from 'libphonenumber-js'; // Removed unused import
import API from "../api";

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState(''); // Restore contact state for email
  const [password, setPwd] = useState('');
  const [userType, setUserType] = useState<'organizer' | 'visitor'>('visitor');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      nav('/'); // Prevent access to register page when already logged in
    }
  }, [nav]); // Added nav dependency

  // Restore isEmail function, keep isPhone removed
  const isEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  // const isPhone = (str: string) => isValidPhoneNumber(str);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Frontend validation
    if (!name.trim()) {
      setError('Username is required');
      return;
    }
    // Restore and update contact validation for email only
    if (!contact.trim()) {
      setError('Email is required');
      return;
    }
    if (!isEmail(contact)) { // Only validate as email
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    // Restore email extraction, keep phone removed
    // let phone = '';
    let email = '';
    if (isEmail(contact)) {
      email = contact;
    } // No else if for phone

    try {
      // The /api prefix has been removed
      // Updated API call to include email, keep phone removed
      await API.post('/auth/register', {
        username: name,
        password,
        userType,
        // ...(phone ? { phone } : {}), // Keep phone removed
        ...(email ? { email } : {}) // Restore email
      });
      setSuccess(true);
      setTimeout(() => nav('/login'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
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
        backgroundAttachment: 'fixed',
      }}
    >

      {/* Registration card */}
      <div className="w-full md:w-1/2 bg-white/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-10 transition-all duration-300 ease-in-out"
           style={{ maxWidth: '550px', minWidth: '320px', backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '16px',
            overflow: 'hidden',
           }}>

        {/* Card title */}
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800"
        style={{ paddingBottom: '2vh'}}>
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
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
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
              className="w-full px-4 py-3 border border-gray-300 bg-white/90 backdrop-blur-sm rounded-xl
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-300
                         shadow-sm transition-all duration-200 ease-in-out"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>

          {/* Contact input RESTORED for Email */}
          <div className="space-y-2">
            <input
              id="contact"
              type="email" // Set type to email for better semantics and potential browser validation
              className="w-full px-4 py-3 border border-gray-300 bg-white/90 backdrop-blur-sm rounded-xl
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-300
                         shadow-sm transition-all duration-200 ease-in-out"
              value={contact}
              onChange={e => setContact(e.target.value)}
              required
              placeholder="Enter your email" // Updated placeholder
            />
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <input
              id="password"
              type="password"
              className="w-full px-4 py-3 border border-gray-300 bg-white/90 backdrop-blur-sm rounded-xl
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-300
                         shadow-sm transition-all duration-200 ease-in-out"
              value={password}
              onChange={e => setPwd(e.target.value)}
              required
              placeholder="Min 8 characters"
            />
          </div>

          {/* User type selection area */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-center ">
              {[
                { label: 'Visitor', value: 'visitor', icon: '👤' },
                { label: 'Organizer', value: 'organizer', icon: '🏢' },
              ].map(({ label, value, icon }) => (
                <label
                  key={value}
                  className={`
                    inline-flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-lg bg-transparent
                    transition-all duration-200 ease-in-out hover:bg-indigo-50 hover:shadow-md
                    ${userType === value
                      ? 'text-indigo-700 shadow-md'
                      : 'text-gray-700'}
                  `}
                >
                  <input
                    type="radio"
                    name="userType"
                    value={value}
                    checked={userType === value}
                    onChange={() => setUserType(value as any)}
                    className="sr-only" // Hide the default radio button and use custom styles
                  />
                  <span className="text-xl">{icon}</span>
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Register button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              style={{ backgroundColor: 'rgba(54, 53, 53, 0.5)' }}
            >
              Create Account
            </button>

            {/* Login link */}
            <p className="mt-8 text-sm text-center text-gray-600" style={{ paddingTop: '1vh' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-green-600 hover:text-green-800 font-medium"
              >
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

