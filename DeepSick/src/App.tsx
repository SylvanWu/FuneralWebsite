import React, { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  Outlet,
} from 'react-router-dom';

import Layout from './components/Layout';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import Timeline, { Memory } from './components/Timeline';
import RoleProtected from './components/RoleProtected';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WillsPage from './pages/WillsPage';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import CreateFuneralPage from './pages/CreateFuneralPage';

import InteractivePage from './pages/InteractivePage';
import CandlePage from './pages/CandlePage';
import FlowerPage from './pages/FlowerPage';
import MessagePage from './pages/MessagePage';

import DreamList from './components/DreamList/DreamList';
import DreamShrink from './components/DreamList/DreamShrink';

/* API */
import { fetchMemories, createMemory, deleteMemory } from './api';
import ProfilePage from './pages/ProfilePage';

import './App.css';

interface BackendMemory {
  _id: string;
  uploaderName: string;
  uploadTime: string;
  memoryType: 'image' | 'video' | 'text';
  memoryContent: string;
}

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

  const [memories, setMemories] = useState<Memory[]>([]);
  const [name, setName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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
    if (window.location.pathname !== '/') return;

    (async () => {
      try {
        const res = await fetchMemories();
        const data = (res.data ?? res) as BackendMemory[];
        setMemories(
          data.map(m => ({
            id: m._id,
            type: m.memoryType,
            preview: m.memoryContent,
            uploadTime: new Date(m.uploadTime),
            uploaderName: m.uploaderName,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch memories:', err);
      }
    })();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (isUploading) return;
    setIsUploading(true);
    try {
      let type: 'image' | 'video' | 'text' = 'image';
      let preview = '';
      let memoryContent = '';

      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
        memoryContent = preview;
      } else if (file.type.startsWith('video/')) {
        type = 'video';
        preview = URL.createObjectURL(file);
        memoryContent = preview;
      } else if (file.type === 'text/plain') {
        type = 'text';
        const txt = await file.text();
        preview = txt.slice(0, 500) + (txt.length > 500 ? '...' : '');
        memoryContent = txt;
      }

      const fd = new FormData();
      fd.append('file', file);
      fd.append('uploaderName', name || 'Anonymous');
      fd.append('memoryType', type);
      if (type === 'text') fd.append('memoryContent', memoryContent);

      const resp = await createMemory(fd);
      setMemories(prev => [
        {
          id: resp.data._id,
          type,
          preview,
          uploadTime: new Date(),
          uploaderName: name || 'Anonymous',
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await deleteMemory(id);
      setMemories(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Delete failed, please try again');
    }
  };

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

          {/* 原来的纪念馆主页移到/hall路径 */}
          <Route path="/hall" element={
            isLoggedIn ? (
              <>
                {/* —— White Card —— */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-10">
                  {/* Title Image + Description */}
                  <div className="md:flex md:items-center md:space-x-6 mb-8">
                    <div className="md:w-1/2 mb-6 md:mb-0">
                      <img
                        src="/Hall.png"
                        alt="Digital Memorial Hall"
                        className="w-full rounded-lg"
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-1">
                        Your Name (Optional)
                      </label>
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Please enter your name"
                        className="w-full px-4 py-2 border rounded"
                      />
                    </div>
                    <UploadArea onFileUpload={handleFileUpload} isUploading={isUploading} />
                  </div>
                  <Timeline
                    memories={memories}
                    onDeleteMemory={handleDeleteMemory}
                    canDelete={role === 'admin'}
                  />
                </div>
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

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
          <Route
            path="/create-funeral"
            element={
              isLoggedIn ? (
                <RoleProtected allow={['organizer', 'admin']}>
                  <CreateFuneralPage />
                </RoleProtected>
              ) : (
                <Navigate to="/login" replace/>
              )
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />} />
        </Route>
      </Routes>
    </div>
  );
}