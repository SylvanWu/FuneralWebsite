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
  const [userType, setUserType] = useState<'organizer' | 'visitor'>('visitor');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      //The /api has been removed
      const response = await API.post('/auth/login', {
        username,
        password,
        userType
      });
      
      // Save user info and token
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.user.userType);
      
      // Call the setToken function passed from App.tsx to update app state
      setToken(response.data.token);
      
      // Redirect based on user type - default to funeralhall for all users
      switch(response.data.user.userType) {
        case 'organizer':
          navigate('/organizer-dashboard');
          break;
        case 'visitor':
          navigate('/funeralhall');
          break;
        default:
          navigate('/funeralhall');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (token && userStr) {
      // If already logged in, redirect to funeralhall
      navigate('/funeralhall', { replace: true });
    }
  }, [navigate]);

  console.log('HomePage loaded');

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center"
      style={{
        backgroundImage: "url('/login.png')",
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
        style={{ paddingBottom: '2vh'}}>
          <span className="relative inline-block pb-2 after:content-[''] after:absolute after:w-1/2 after:h-0.5 after:bg-indigo-500 after:bottom-0 after:left-1/4">
            Sign In
          </span>
        </h1>

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
              className="w-full px-4 py-3 border border-gray-300 bg-white/90 backdrop-blur-sm rounded-xl 
                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-300
                       shadow-sm transition-all duration-200 ease-in-out"
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
              className="w-full px-4 py-3 border border-gray-300 bg-white/90 backdrop-blur-sm rounded-xl 
                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-300
                       shadow-sm transition-all duration-200 ease-in-out"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {/*  User type selection area */}
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
                    className="sr-only" // Hide the native radio buttons and use custom styles instead

                  />
                  <span className="text-xl">{icon}</span>
                  <span>{label}</span>
                </label>
              ))}
            </div>
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
