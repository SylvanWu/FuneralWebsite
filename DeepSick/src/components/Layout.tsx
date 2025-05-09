import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import './Layout.css'; // 新建或已有的CSS文件
import defaultAvatar from '../assets/avatar.png'; // 路径根据实际情况调整
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function Layout({ onLogout }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [showPwdModal, setShowPwdModal] = useState(false);

  // 读取用户信息，回退到默认头像
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const avatar = user.avatar || defaultAvatar;
  const displayName = user.nickname || user.username || '未登录';

  // 点击外部关闭下拉
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigate = useNavigate();

  return (
    <div>
      <nav className="topbar">
        <div className="nav-left"></div>
        <div className="nav-center">
          <div className="nav-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
            <Link to="/hall" className={location.pathname === '/hall' ? 'active' : ''}>Memorial Hall</Link>
            <Link to="/wills" className={location.pathname === '/wills' ? 'active' : ''}>Wills</Link>
            <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin</Link>
            <Link to="/interactive" className={location.pathname === '/interactive' ? 'active' : ''}>Interactive</Link>
          </div>
        </div>
        <div className="right-btns">
          <div className="avatar-dropdown" ref={menuRef} style={{ position: 'relative' }}>
            <img
              src={avatar}
              alt="avatar"
              className="avatar-img"
              onClick={() => setMenuOpen(v => !v)}
              style={{ cursor: 'pointer' }}
            />
            {menuOpen && (
              <div
                style={{
                  minWidth: 220,
                  background: '#fff',
                  borderRadius: 16,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                  padding: 24,
                  position: 'absolute',
                  top: 50,
                  right: 0,
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <img
                  src={avatar}
                  alt="avatar"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    border: '2px solid #eee',
                    objectFit: 'cover',
                    marginBottom: 12
                  }}
                />
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                  {displayName}
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/profile');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    background: '#4ade80',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 16,
                    marginBottom: 12,
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={e => (e.target.style.background = '#22c55e')}
                  onMouseOut={e => (e.target.style.background = '#4ade80')}
                >
                  Edit Information
                </button>
                <button
                  onClick={() => setShowPwdModal(true)}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    background: '#f3f4f6',
                    color: '#222',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 500,
                    fontSize: 15,
                    marginBottom: 0,
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={e => (e.target.style.background = '#e5e7eb')}
                  onMouseOut={e => (e.target.style.background = '#f3f4f6')}
                >
                  Change Password
                </button>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
          <Link to="/dreamlist" className="dreamlist-btn">DreamList</Link>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
      {showPwdModal && <ChangePasswordModal onClose={() => setShowPwdModal(false)} />}
    </div>
  );
}
