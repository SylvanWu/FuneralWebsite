import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import './Layout.css'; // 新建或已有的CSS文件

export default function Layout({ onLogout }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // 假设有用户信息
  const user = {
    avatar: '/avatar.png', // 你的头像图片路径
    nickname: 'user',
  };

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
          <div className="avatar-dropdown" ref={menuRef}>
            <img
              src={user.avatar}
              alt="avatar"
              className="avatar-img"
              onClick={() => setMenuOpen(v => !v)}
            />
            {menuOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header-simple">
                  <img src={user.avatar} alt="avatar" className="dropdown-avatar" />
                  <div className="dropdown-nickname">{user.nickname}</div>
                </div>
                <button
                  className="dropdown-edit-btn"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/profile'); // 跳转到个人信息编辑页
                  }}
                >
                  修改个人信息
                </button>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
          <Link to="/dreamlist" className="dreamlist-btn">愿望清单</Link>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
