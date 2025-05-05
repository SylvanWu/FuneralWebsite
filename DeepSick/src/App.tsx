//应用的根组件，处理路由导航，根据用户的登录状态显示不同的页面，并提供登出功能。
//
// // src/App.tsx
// import React, { useState, useEffect } from 'react';
// import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
//
// // 原先的组件
// import Header      from './components/Header';
// import UploadArea  from './components/UploadArea';
// import Timeline, { Memory } from './components/Timeline';
// import LoginPage   from './pages/LoginPage';
// import WillsPage   from './pages/WillsPage';
// import './App.css';
//
// // API 调用
// import { fetchMemories, createMemory, deleteMemory } from './api';
//
// interface BackendMemory {
//     _id: string;
//     uploaderName: string;
//     uploadTime: string;
//     memoryType: 'image' | 'video' | 'text';
//     memoryContent: string;
// }
//
// export default function App() {
//     const navigate = useNavigate();
//     const token    = localStorage.getItem('token');
//     const isLoggedIn = Boolean(token);
//
//     // Memories 列表
//     const [memories, setMemories] = useState<Memory[]>([]);
//     // 上传者名字（可选）
//     const [name, setName]         = useState('');
//     const [isUploading, setIsUploading] = useState(false);
//
//     // 拉记忆列表
//     useEffect(() => {
//         (async () => {
//             try {
//                 const res = await fetchMemories();
//                 const data: BackendMemory[] = res.data ?? res;
//                 const formatted = data.map(m => ({
//                     id: m._id,
//                     type: m.memoryType,
//                     preview: m.memoryContent,
//                     uploadTime: new Date(m.uploadTime),
//                     uploaderName: m.uploaderName,
//                 }));
//                 setMemories(formatted);
//             } catch (err) {
//                 console.error('获取记忆失败', err);
//             }
//         })();
//     }, []);
//
//     // 文件上传
//     const handleFileUpload = async (file: File) => {
//         if (isUploading) return;
//         setIsUploading(true);
//
//         try {
//             let type: 'image'|'video'|'text' = 'image';
//             let preview = '';
//             let memoryContent = '';
//
//             if (file.type.startsWith('image/')) {
//                 type = 'image';
//                 preview = URL.createObjectURL(file);
//                 memoryContent = preview;
//             } else if (file.type.startsWith('video/')) {
//                 type = 'video';
//                 preview = URL.createObjectURL(file);
//                 memoryContent = preview;
//             } else if (file.type === 'text/plain') {
//                 type = 'text';
//                 const txt = await file.text();
//                 preview = txt.slice(0, 500) + (txt.length > 500 ? '...' : '');
//                 memoryContent = txt;
//             }
//
//             const fd = new FormData();
//             fd.append('file', file);
//             fd.append('uploaderName', name || 'Anonymous');
//             fd.append('memoryType', type);
//             if (type === 'text') fd.append('memoryContent', memoryContent);
//
//             const resp = await createMemory(fd);
//             setMemories(prev => [{
//                 id: resp.data._id,
//                 type,
//                 preview,
//                 uploadTime: new Date(),
//                 uploaderName: name || 'Anonymous'
//             }, ...prev]);
//         } catch (err) {
//             console.error('上传失败', err);
//         } finally {
//             setIsUploading(false);
//         }
//     };
//
//     // 删除 Memory
//     const handleDeleteMemory = async (id: string) => {
//         try {
//             await deleteMemory(id);
//             setMemories(prev => prev.filter(m => m.id !== id));
//         } catch (err) {
//             console.error('删除失败', err);
//             alert('删除失败，请重试');
//         }
//     };
//
//     // 登出
//     const handleLogout = () => {
//         localStorage.removeItem('token');
//         navigate('/login', { replace: true });
//     };
//
//     return (
//         <div className="min-h-screen bg-gray-50 text-gray-800">
//             {/* ====== 原先的顶部导航 ====== */}
//             <nav className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
//                 <div className="flex items-center">
//                     <span className="text-xl font-bold">88</span>
//                 </div>
//                 <div className="hidden md:flex space-x-6">
//                     <a href="#" className="text-gray-700 hover:text-gray-900">Products</a>
//                     <a href="#" className="text-gray-700 hover:text-gray-900">Solutions</a>
//                     <a href="#" className="text-gray-700 hover:text-gray-900">Community</a>
//                     <a href="#" className="text-gray-700 hover:text-gray-900">Resources</a>
//                     <a href="#" className="text-gray-700 hover:text-gray-900">Pricing</a>
//                     <a href="#" className="text-gray-700 hover:text-gray-900">Contact</a>
//                     <a href="#" className="text-gray-700 hover:text-gray-900">Link</a>
//                 </div>
//                 <div className="flex space-x-2">
//                     {isLoggedIn
//                         ? <button onClick={handleLogout} className="px-4 py-1 border border-gray-300 rounded-lg bg-gray-100">Logout</button>
//                         : <button className="px-4 py-1 bg-gray-800 text-white rounded-lg">Register</button>
//                     }
//                 </div>
//             </nav>
//
//             <div className="container mx-auto px-4 py-8">
//                 {/* ====== 原先的首页大图 + Header ====== */}
//                 <div className="md:flex md:items-center md:space-x-6 mb-10">
//                     <div className="md:w-1/2 mb-6 md:mb-0">
//                         <img
//                             src="/Hall.png"
//                             alt="Digital Memorial Hall"
//                             className="w-full rounded-lg shadow-md"
//                         />
//                     </div>
//                     <div className="md:w-1/2">
//                         <Header />
//                     </div>
//                 </div>
//
//                 {/* ====== 路由区块 ====== */}
//                 <Routes>
//                     <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace/> : <LoginPage/>} />
//
//                     <Route path="/" element={
//                         isLoggedIn
//                             ? (
//                                 <>
//                                     {/* ====== 上传区 ====== */}
//                                     <div className="mb-6">
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             Your Name (Optional)
//                                         </label>
//                                         <input
//                                             type="text"
//                                             className="w-full px-4 py-2 border rounded-md"
//                                             placeholder="Please enter your name"
//                                             value={name}
//                                             onChange={e => setName(e.target.value)}
//                                         />
//                                     </div>
//                                     <UploadArea onFileUpload={handleFileUpload} />
//                                     {/* ====== 时间线 ====== */}
//                                     <Timeline
//                                         memories={memories}
//                                         onDeleteMemory={handleDeleteMemory}
//                                     />
//                                 </>
//                             )
//                             : <Navigate to="/login" replace/>
//                     }/>
//
//                     <Route path="/wills" element={
//                         isLoggedIn
//                             ? <WillsPage/>
//                             : <Navigate to="/login" replace/>
//                     }/>
//
//                     <Route path="*" element={
//                         <Navigate to={isLoggedIn ? "/" : "/login"} replace/>
//                     }/>
//                 </Routes>
//             </div>
//         </div>
//     );
// }

/* src/App.tsx */
/* --------------------------------------------------
 * src/App.tsx
 * 根组件：路由 + 顶部导航 + 首页上传区
 * -------------------------------------------------- */
import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';

/* 页面 & 组件 */
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import Timeline, { Memory } from './components/Timeline';
import LoginPage from './pages/LoginPage';
import WillsPage from './pages/WillsPage';
import RegisterPage from './pages/RegisterPage';
import RoleProtected from './components/RoleProtected';
import AdminPage from './pages/AdminPage';



/* API */
import { fetchMemories, createMemory, deleteMemory } from './api';

/* 样式 */
import './App.css';

//can
import { DreamList } from './components/DreamList/DreamList'

/* 后端返回的 Memory 结构 */
interface BackendMemory {
  _id: string;
  uploaderName: string;
  uploadTime: string;
  memoryType: 'image' | 'video' | 'text';
  memoryContent: string;
}

export default function App() {
  /* -------------- 登录状态 -------------- */
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const isLoggedIn = Boolean(token);

  /* -------------- 首页：时间线 & 上传 -------------- */
  const [memories, setMemories] = useState<Memory[]>([]);
  const [name, setName] = useState('');
  const [isUploading, setUpload] = useState(false);

  /* 拉取时间线 */
  useEffect(() => {
    (async () => {
      try {
        const list: BackendMemory[] = await fetchMemories();
        setMemories(
          list.map(m => ({
            id: m._id,
            type: m.memoryType,
            preview: m.memoryContent,
            uploadTime: new Date(m.uploadTime),
            uploaderName: m.uploaderName,
          }))
        );
      } catch (err) {
        console.error('获取记忆失败', err);
      }
    })();
  }, []);

  /* 上传文件 */
  const handleFileUpload = async (file: File) => {
    if (isUploading) return;
    setUpload(true);

    try {
      /* 根据类型生成预览 & 字段 */
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

      /* 发送到后端 */
      const fd = new FormData();
      fd.append('file', file);
      fd.append('uploaderName', name || 'Anonymous');
      fd.append('memoryType', type);
      if (type === 'text') fd.append('memoryContent', memoryContent);

      const saved = await createMemory(fd);

      setMemories(prev => [
        {
          id: saved._id,
          type,
          preview,
          uploadTime: new Date(),
          uploaderName: name || 'Anonymous',
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('上传失败', err);
      alert('上传失败，请稍后重试');
    } finally {
      setUpload(false);
    }
  };

  /* 删除 Memory */
  const handleDeleteMemory = async (id: string) => {
    try {
      await deleteMemory(id);
      setMemories(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('删除失败', err);
      alert('删除失败，请重试');
    }
  };

  /* 登出 */
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  /* -------------- UI -------------- */
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      {/* ===== 顶部导航 ===== */}
      <nav className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <div className="flex items-center space-x-6">
          {/* 只有 organizer 或 admin 才能看到意志管理 */}
          {(role === 'organizer' || role === 'admin') && (
            <Link to="/wills" className="nav-link">意志栏</Link>
          )}


          {/* 只有 admin 才能看到管理员页 */}
          {role === 'admin' && (
            <Link to="/admin" className="nav-link">Admin</Link>
          )}

          <Link to="/" className="text-xl font-bold text-[var(--link-color)]">
            88
          </Link>
          <Link to="/" className="nav-link">产品</Link>
          <Link to="/" className="nav-link">解决方案</Link>
          <Link to="/" className="nav-link">社区</Link>
          <Link to="/" className="nav-link">资源</Link>

          <Link to="/" className="nav-link">接触</Link>


        </div>
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="px-4 py-1 bg-gray-100 border border-gray-300 rounded"
          >
            Logout
          </button>
        ) : (
          <Link to="/login" className="px-4 py-1 bg-blue-600 text-white rounded">
            Login
          </Link>
        )}

        {/* can 临时愿望清单的link*/}
        < Link to="/dreamlist" className="text-blue-600 hover:underline" > 愿望清单</Link >
      </nav>





      {/* ===== 路由出口 ===== */}
      <div className="container mx-auto px-4 py-8">
        <Routes>
          {/* 登录页 */}
          <Route
            path="/login"
            element={
              isLoggedIn ? <Navigate to="/" replace /> : <LoginPage />
            }
          />

          {/* 首页（卡片 + 时间线） */}
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <>
                  {/* —— 白色卡片 —— */}
                  <div className="bg-white rounded-lg shadow-md p-8 mb-10">
                    {/* 标题图 + 描述 */}
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

                    {/* 姓名输入 */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-1">
                        您的姓名（可选）
                      </label>
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="请输入您的姓名"
                        className="w-full px-4 py-2 border rounded"
                      />
                    </div>

                    {/* 上传区 */}
                    <UploadArea onFileUpload={handleFileUpload} />
                  </div>

                  {/* —— 时间线 —— */}
                  <Timeline
                    memories={memories}
                    onDeleteMemory={handleDeleteMemory}
                  />
                </>
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

          {/* 遗嘱页 */}
          <Route
            path="/wills"
            element={
              isLoggedIn ? <WillsPage /> : <Navigate to="/login" replace />
            }
          />


          {/* 兜底 */}
          <Route
            path="*"
            element={
              <Navigate to={isLoggedIn ? '/' : '/login'} replace />
            }
          />
          <Route
            path="/register"
            element={
              isLoggedIn ? <Navigate to="/" replace /> : <RegisterPage />
            }
          />


          {/* 临时的愿望清单route */}
          <Route
            path="/dreamlist"
            element={<DreamList />}
          />

        </Routes>
      </div>
    </div>
  );
}

