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
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {})
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
      className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-4 md:p-0"
      style={{
        backgroundImage: "url('/1.jpg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        
      }}
    >


      {/* 注册卡片 */}
      <div className="w-full md:w-1/2 bg-white/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-10 transition-all duration-300 ease-in-out" 
           style={{ maxWidth: '550px', minWidth: '320px',backgroundColor: 'rgba(255, 255, 255, 0.5)'}}>
        
        {/* 卡片标题 */}
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
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
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
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
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Phone Number / Email</label>
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
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

          {/* 角色选择区域 */}
          <div className="space-y-3 pt-2">
            <label className="block text-sm font-medium text-gray-700">Select Role</label>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-2">
              {[
                { label: 'Visitor', value: 'visitor', icon: '👤' },
                { label: 'Organizer', value: 'organizer', icon: '🏢' },
              ].map(({ label, value, icon }) => (
                <label 
                  key={value} 
                  className={`
                    inline-flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-lg border
                    transition-all duration-200 ease-in-out hover:bg-indigo-50 hover:shadow-md
                    ${role === value 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md' 
                      : 'border-gray-300 text-gray-700'}
                  `}
                >
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    checked={role === value}
                    onChange={() => setRole(value as any)}
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
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl 
                        shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out 
                        transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50
                        cursor-pointer"
            >
              Create Account
            </button>
                  {/* Login按钮 */}
      <button
        onClick={() => nav('/login')}
        className="absolute top-4 right-4 px-5 py-2.5 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-105 text-gray-800 font-medium shadow-lg transition-all duration-300 ease-in-out cursor-pointer z-50"
      >
        Login
      </button>
          </div>
        </form>
      </div>
    </div>
  );
}
