import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';

/* Pages & Components */
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import Timeline, { Memory } from './components/Timeline';
import LoginPage from './pages/LoginPage';
import WillsPage from './pages/WillsPage';
import RegisterPage from './pages/RegisterPage';
import RoleProtected from './components/RoleProtected';
import AdminPage from './pages/AdminPage';

// Add new interactive pages
import InteractivePage from './pages/InteractivePage';
import CandlePage from './pages/CandlePage';
import FlowerPage from './pages/FlowerPage';
import MessagePage from './pages/MessagePage';

/* API */
import { fetchMemories, createMemory, deleteMemory } from './api';

/* Styles */
import './App.css';

/* Backend Memory structure */
interface BackendMemory {
  _id: string;
  uploaderName: string;
  uploadTime: string;
  memoryType: 'image' | 'video' | 'text';
  memoryContent: string;
}

export default function App() {
  /* -------------- Login Status -------------- */
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const isLoggedIn = Boolean(token);

  /* -------------- Home: Timeline & Upload -------------- */
  const [memories, setMemories] = useState<Memory[]>([]);
  const [name, setName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  /* Fetch Timeline */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchMemories();
        const data: BackendMemory[] = res.data ?? res;
        const formatted = data.map(m => ({
          id: m._id,
          type: m.memoryType,
          preview: m.memoryContent,
          uploadTime: new Date(m.uploadTime),
          uploaderName: m.uploaderName,
        }));
        setMemories(formatted);
      } catch (err) {
        console.error('Failed to fetch memories:', err);
      }
    })();
  }, []);

  /* File Upload */
  const handleFileUpload = async (file: File) => {
    if (isUploading) return;
    setIsUploading(true);

    try {
      let type: 'image' | 'video' | 'text' = 'image';
      let preview = '';
      let memoryContent = '';

      if (file.type.startsWith('image/')) {
        type = 'image';
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
      setMemories(prev => [{
        id: resp.data._id,
        type,
        preview,
        uploadTime: new Date(),
        uploaderName: name || 'Anonymous'
      }, ...prev]);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  /* Delete Memory */
  const handleDeleteMemory = async (id: string) => {
    try {
      await deleteMemory(id);
      setMemories(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Delete failed, please try again');
    }
  };

  /* Logout */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* ===== Top Navigation ===== */}
      <nav className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <div className="flex items-center space-x-6">
          {(role === 'organizer' || role === 'admin') && (
            <Link to="/wills" className="text-gray-700 hover:text-gray-900">Wills</Link>
          )}
          {role === 'admin' && (
            <Link to="/admin" className="text-gray-700 hover:text-gray-900">Admin</Link>
          )}

          <Link to="/" className="text-gray-700 hover:text-gray-900">TimeLine</Link>  
          <Link to="/" className="text-gray-700 hover:text-gray-900">Home</Link>
          <Link to="/" className="text-gray-700 hover:text-gray-900">Products</Link>
          <Link to="/" className="text-gray-700 hover:text-gray-900">Solutions</Link>
          <Link to="/" className="text-gray-700 hover:text-gray-900">Community</Link>
          <Link to="/" className="text-gray-700 hover:text-gray-900">Resources</Link>
          <Link to="/" className="text-gray-700 hover:text-gray-900">Contact</Link>
          <Link to="/interactive" className="text-gray-700 hover:text-gray-900">Interactive</Link>
        </div>
        <div className="flex space-x-2">
          {isLoggedIn ? (
            <button onClick={handleLogout} className="px-4 py-1 border border-gray-300 rounded-lg bg-gray-100">
              Logout
            </button>
          ) : (
            <Link to="/login" className="px-4 py-1 bg-gray-800 text-white rounded-lg">
              Login
            </Link>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 w-full max-w-full">
        {/* ===== Routes ===== */}
        <Routes>
          <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace/> : <LoginPage/>} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/" element={
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
                    <div className="md:w-1/2">
                      <Header />
                    </div>
                  </div>

                  {/* Name Input */}
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

                  {/* Upload Area */}
                  <UploadArea onFileUpload={handleFileUpload} />
                </div>

                {/* —— Timeline —— */}
                <Timeline
                  memories={memories}
                  onDeleteMemory={handleDeleteMemory}
                  canDelete={role === 'admin'}
                />
              </>
            ) : (
              <Navigate to="/login" replace/>
            )
          }/>

          {/* Admin Page */}
          <Route
            path="/admin"
            element={
              <RoleProtected allow={['admin']}>
                <AdminPage />
              </RoleProtected>
            }
          />

          {/* Wills Page */}
          <Route
            path="/wills"
            element={
              isLoggedIn ? (
                <RoleProtected allow={['organizer', 'admin']}>
                  <WillsPage />
                </RoleProtected>
              ) : (
                <Navigate to="/login" replace/>
              )
            }
          />

          {/* Interactive pages routes */}
          <Route path="/interactive" element={
            isLoggedIn ? <InteractivePage /> : <Navigate to="/login" replace/>
          }/>
          <Route path="/candle" element={
            isLoggedIn ? <CandlePage /> : <Navigate to="/login" replace/>
          }/>
          <Route path="/Flower" element={
            isLoggedIn ? <FlowerPage /> : <Navigate to="/login" replace/>
          }/>
          <Route path="/Message" element={
            isLoggedIn ? <MessagePage /> : <Navigate to="/login" replace/>
          }/>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} replace/>} />
        </Routes>
      </div>
    </div>
  );
}