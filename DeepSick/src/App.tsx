
import React, { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
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

import InteractivePage from './pages/InteractivePage';
import CandlePage from './pages/CandlePage';
import FlowerPage from './pages/FlowerPage';
import MessagePage from './pages/MessagePage';

import { fetchMemories, createMemory, deleteMemory } from './api';

import './App.css';

interface BackendMemory {
  _id: string;
  uploaderName: string;
  uploadTime: string;
  memoryType: 'image' | 'video' | 'text';
  memoryContent: string;
}

export default function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const isLoggedIn = Boolean(token);

  const [memories, setMemories] = useState<Memory[]>([]);
  const [name, setName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-800">
      <Routes>
        {/* ✅ Login/Register 页面独立，不使用 Layout 包裹 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ✅ 其他页面由 Layout 包裹 */}
        <Route element={<Layout onLogout={handleLogout} />}>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <>
                  <div className="bg-white rounded-lg shadow-md p-8 mb-10">
                    <div className="md:flex md:items-center md:space-x-6 mb-8">
                      <div className="md:w-1/2 mb-6 md:mb-0">
                        <img
                          src="/Hall.png"
                          alt="Digital Memorial Hall"
                          className="w-full rounded-lg"
                        />
                      </div>
                      <div className="md:w-1/2">
                        <Header />
                      </div>
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
                </>
              ) : (
                <Navigate to="/login" replace />
              )
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
          <Route
            path="/admin"
            element={
              <RoleProtected allow={['admin']}>
                <AdminPage />
              </RoleProtected>
            }
          />
          <Route path="/interactive" element={isLoggedIn ? <InteractivePage /> : <Navigate to="/login" replace />} />
          <Route path="/candle" element={isLoggedIn ? <CandlePage /> : <Navigate to="/login" replace />} />
          <Route path="/flower" element={isLoggedIn ? <FlowerPage /> : <Navigate to="/login" replace />} />
          <Route path="/message" element={isLoggedIn ? <MessagePage /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />} />
        </Route>
      </Routes>
    </div>
  );
}