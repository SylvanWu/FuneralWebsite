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

  useEffect(() => {
    // 页面关闭或刷新时清除登录信息
    const handleUnload = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
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
        {/* ✅ Login/Register 页面独立，不使用 Layout 包裹 */}
        <Route path="/login" element={<LoginPage setToken={setToken} />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ✅ 其他页面由 Layout 包裹 */}
        <Route element={<Layout onLogout={handleLogout} />}>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <HomePage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* 纪念馆主页 */}
          <Route
            path="/hall"
            element={
              isLoggedIn ? (
                <HallPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Admin Page */}
          <Route
            path="/admin"
            element={
              <RoleProtected allow={['admin']}>
                <AdminPage />
              </RoleProtected>
            }
          />
          <Route
            path="/wills"
            element={
              isLoggedIn ? (
                <RoleProtected allow={['organizer', 'admin']}>
                  <WillsPage />
                </RoleProtected>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route path="/interactive" element={isLoggedIn ? <InteractivePage /> : <Navigate to="/login" replace />} />
          <Route path="/candle" element={isLoggedIn ? <CandlePage /> : <Navigate to="/login" replace />} />
          <Route path="/flower" element={isLoggedIn ? <FlowerPage /> : <Navigate to="/login" replace />} />
          <Route path="/message" element={isLoggedIn ? <MessagePage /> : <Navigate to="/login" replace />} />
          <Route path="/dreamlist" element={<DreamShrink />} />
          <Route path="/create-funeral" element={<CreateFuneralPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* 组织者路由 */}
          <Route
            path="/organizer-dashboard"
            element={
              <RoleProtected userType="organizer">
                <OrganizerDashboard />
              </RoleProtected>
            }
          />

          {/* 访客路由 */}
          <Route
            path="/visitor-dashboard"
            element={
              <RoleProtected userType="visitor">
                <VisitorDashboard />
              </RoleProtected>
            }
          />

          {/* 亲友路由 */}
          <Route
            path="/loved-one-dashboard"
            element={
              <RoleProtected userType="lovedOne">
                <LovedOneDashboard />
              </RoleProtected>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />} />
        </Route>
      </Routes>
    </div>
  );
}