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

import HomePage from './pages/HomePage';
import CreateFuneralPage from './pages/CreateFuneralPage';
import FuneralRoomPage from './pages/FuneralRoomPage';
import FuneralRoomHallPage from './pages/FuneralRoomHallPage';

import InteractivePage from './pages/InteractivePage';
import CandlePage from './pages/CandlePage';
import FlowerPage from './pages/FlowerPage';
import MessagePage from './pages/MessagePage';

import DreamList from './components/DreamList/DreamList';
import DreamShrink from './components/DreamList/DreamShrink';

import ProfilePage from './pages/ProfilePage';
import OrganizerDashboard from './pages/OrganizerDashboard';
import VisitorDashboard from './pages/VisitorDashboard';

import DreamEditor from './components/DreamList/DreamEditor';  // 编辑页面组件

import './App.css';
import { SocketProvider } from './context/SocketContext';

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

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const isLoggedIn = Boolean(token);

  // Listen for localStorage changes (login/logout)
  useEffect(() => {
    const onStorage = () => {
      setToken(localStorage.getItem('token'));
      setRole(localStorage.getItem('role'));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Manually update state after login/logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setToken(null);
    setRole(null);
    navigate('/login', { replace: true });
  };

  return (
    <SocketProvider>
      <div className="min-h-screen bg-transparent text-gray-800">
        <Routes>
          {/* Login/Register pages */}
          <Route path="/login" element={<LoginPage setToken={setToken} />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Dashboard routes - outside Layout */}
          <Route
            path="/visitor-dashboard"
            element={
              <ProtectedRoute>
                <VisitorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer-dashboard"
            element={
              <ProtectedRoute>
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Other pages wrapped in Layout */}
          <Route element={<Layout onLogout={handleLogout} />}>
            {/* Homepage */}
            <Route path="/" element={<HomePage />} />

            {/* Other public pages */}
            <Route path="/hall" element={<Navigate to="/interactive" replace />} />
            <Route path="/funeralhall" element={<FuneralRoomHallPage />} />
            <Route path="/interactive" element={<InteractivePage />} />
            <Route path="/interactive/:roomId" element={<InteractivePage />} />
            <Route path="/candle" element={<CandlePage />} />
            <Route path="/flower" element={<FlowerPage />} />
            <Route path="/message" element={<MessagePage />} />
            <Route path="/create-funeral" element={<CreateFuneralPage />} />
            <Route path="/funeral-room/:roomId" element={<FuneralRoomPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* 编辑页面的路由，路径包含 roomId 参数 */}
            <Route path="/interactive/:roomId/edit" element={<DreamEditor />} />
            {/* 房间列表页面的路由 */}
            <Route path="/interactive/:roomId" element={<DreamList />} />

            {/* Room placeholder page */}
            <Route path="/room" element={<div className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Room</h1>
              <p className="text-gray-600">This page is under construction.</p>
            </div>} />

            {/* Admin placeholder page */}
            <Route path="/admin" element={<div className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Admin</h1>
              <p className="text-gray-600">This page is under construction.</p>
            </div>} />

            {/* Wills and DreamList pages */}
            <Route
              path="/wills"
              element={
                <RoleProtected userType="organizer">
                  <WillsPage />
                </RoleProtected>
              }
            />
            <Route
              // path="/dreamlist"
              path="/dreamlist/:roomId"
              element={
                <RoleProtected userType="organizer">
                  <DreamShrink />
                </RoleProtected>
              }
            />
          </Route>

          <Route
            path="/dreamlist/edit"
            element={
              <RoleProtected userType="organizer">
                <DreamEditor />
              </RoleProtected>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </SocketProvider>
  );
}