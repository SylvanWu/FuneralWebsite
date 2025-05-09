import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './Layout.css'; // 新建或已有的CSS文件

export default function Layout({ onLogout }) {
  const location = useLocation();

  return (
    <div>
      <nav className="topbar">
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/hall" className={location.pathname === '/hall' ? 'active' : ''}>Memorial Hall</Link>
          <Link to="/wills" className={location.pathname === '/wills' ? 'active' : ''}>Wills</Link>
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin</Link>
          <Link to="/interactive" className={location.pathname === '/interactive' ? 'active' : ''}>Interactive</Link>
        </div>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
