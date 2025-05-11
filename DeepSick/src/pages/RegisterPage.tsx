// ✅ RegisterPage.tsx
import React, { useEffect, useState } from 'react';
import { registerUser } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { isValidPhoneNumber } from 'libphonenumber-js';
import API from "../api";

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
      await API.post('/api/auth/register', {
        username: name,
        password,
        userType,
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {})
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


      {/* 注册卡片 */}
      <div className="w-full md:w-1/2 bg-white/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-10 transition-all duration-300 ease-in-out" 
           style={{ maxWidth: '550px', minWidth: '320px',backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(16px)',                   
            WebkitBackdropFilter: 'blur(16px)',            
            borderRadius: '16px',                            
            overflow: 'hidden',                              
           }}>
        
        {/* 卡片标题 */}
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800"
        style={{ paddingBottom: '2vh'}}>
          
          <span className="relative inline-block pb-2 after:content-[''] after:absolute after:w-1/2 after:h-0.5 after:bg-indigo-500 after:bottom-0 after:left-1/4">
            Create Account
          </span>
        </h1>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50/70 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-center font-medium animate-pulse">
            {error}
          </div>
        )}
        
        {/* 成功提示 */}
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

        {/* 注册表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 用户名输入框 */}
          <div className="space-y-2">
            {/* <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label> */}
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

          {/* 联系方式输入框 */}
          <div className="space-y-2">
            {/* <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Phone Number / Email</label> */}
          <input
              id="contact"
              className="w-full px-4 py-3 border border-gray-300 bg-white/90 backdrop-blur-sm rounded-xl 
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-300
                         shadow-sm transition-all duration-200 ease-in-out"
            value={contact}
            onChange={e => setContact(e.target.value)}
            required
              placeholder="Enter your email or phone number"
          />
          </div>

          {/* 密码输入框 */}
          <div className="space-y-2">
            {/* <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label> */}
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

          {/* 用户类型选择区域 */}
          <div className="space-y-3 pt-2">
            {/* <label className="block text-sm font-medium text-gray-700">Select Role</label> */}
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
                    className="sr-only" // 隐藏原始单选按钮，使用自定义样式
                  />
                  <span className="text-xl">{icon}</span>
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 注册按钮 */}
          <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            style={{ backgroundColor: 'rgba(54, 53, 53, 0.5)'}}
          >
              Create Account
            </button>
                  {/* Login按钮 */}

          <p className="mt-8 text-sm text-center text-gray-600"
        style={{ paddingTop: '1vh'}}>
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
