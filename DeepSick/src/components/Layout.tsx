import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import './Layout.css'; // 新建或已有的CSS文件
import defaultAvatar from '../assets/avatar.png'; // 路径根据实际情况调整

export default function Layout({ onLogout }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // 读取用户信息，回退到默认头像
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const avatar = user.avatar || defaultAvatar;
  const username = user.username || '未登录';

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
              <div className="dropdown-menu">
                <div className="dropdown-header-simple">
                  <img src={avatar} alt="avatar" className="dropdown-avatar" />
                  <div className="dropdown-nickname">{username}</div>
                </div>
                <button
                  className="dropdown-edit-btn"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/profile');
                  }}
                >
                  Edit Information
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
    </div>
  );
}
