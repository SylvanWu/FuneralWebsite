import React, { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  Outlet,
  useLocation,
  Link
} from 'react-router-dom';

import Layout from './components/Layout';
import Header from './components/Header';
import RoleProtected from './components/RoleProtected';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WillsPage from './pages/WillsPage';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import CreateFuneralPage from './pages/CreateFuneralPage';
import FuneralRoomPage from './pages/FuneralRoomPage';
import HallPage from './pages/HallPage';

import InteractivePage from './pages/InteractivePage';
import CandlePage from './pages/CandlePage';
import FlowerPage from './pages/FlowerPage';
import MessagePage from './pages/MessagePage';

import DreamList from './components/DreamList/DreamList';
import DreamShrink from './components/DreamList/DreamShrink';

import ProfilePage from './pages/ProfilePage';
import OrganizerDashboard from './pages/OrganizerDashboard';
import VisitorDashboard from './pages/VisitorDashboard';
import LovedOneDashboard from './pages/LovedOneDashboard';

import './App.css';

// NavLink Component for highlighting active links
const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`nav-link ${isActive ? 'active' : ''}`}
    >
      {children}
    </Link>
  );
};

export default function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const isLoggedIn = Boolean(token);

  // 监听 localStorage 变化（比如登录/登出）
  useEffect(() => {
    const onStorage = () => {
      setToken(localStorage.getItem('token'));
      setRole(localStorage.getItem('role'));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // 登录/登出后手动更新 state
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-800">
      <Routes>
        {/* 登录注册页面 */}
        <Route path="/login" element={<LoginPage setToken={setToken} />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 其他页面由 Layout 包裹 */}
        <Route element={<Layout onLogout={handleLogout} />}>
          {/* 首页 */}
          <Route path="/" element={<HomePage />} />

          {/* 其他公共页面 */}
          <Route path="/hall" element={<HallPage />} />
          <Route path="/interactive" element={<InteractivePage />} />
          <Route path="/candle" element={<CandlePage />} />
          <Route path="/flower" element={<FlowerPage />} />
          <Route path="/message" element={<MessagePage />} />
          <Route path="/create-funeral" element={<CreateFuneralPage />} />
          <Route path="/funeral-room/:roomId" element={<FuneralRoomPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Room 占位页面 */}
          <Route path="/room" element={<div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Room</h1>
            <p className="text-gray-600">This page is under construction.</p>
          </div>} />

          {/* Admin 占位页面 */}
          <Route path="/admin" element={<div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Admin</h1>
            <p className="text-gray-600">This page is under construction.</p>
          </div>} />

          {/* Wills 和 DreamList 页面 */}
          <Route
            path="/wills"
            element={
              <RoleProtected userType="organizer">
                <WillsPage />
              </RoleProtected>
            }
          />
          <Route
            path="/dreamlist"
            element={
              <RoleProtected userType="organizer">
                <DreamList />
              </RoleProtected>
            }
          />
        </Route>

        {/* Visitor Dashboard */}
        <Route path="/visitor-dashboard" element={<VisitorDashboard />} />
      </Routes>
    </div>
  );
}