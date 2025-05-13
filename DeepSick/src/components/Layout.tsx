import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './Layout.css'; // CSS file, newly created or existing
import defaultAvatar from '../assets/avatar.png'; // Adjust the path as needed
import ChangePasswordModal from '../components/ChangePasswordModal';

interface LayoutProps {
  onLogout: () => void;
}

export default function Layout({ onLogout }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showPwdModal, setShowPwdModal] = useState(false);

  // Read user info, fallback to default avatar
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const avatar = user.avatar || defaultAvatar;
  const displayName = user.nickname || user.username || 'Not Logged In';
  const isLoggedIn = !!localStorage.getItem('token');

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigate = useNavigate();

  return (
    <div>
      <nav className="simplified-topbar">
        <div className="right-btns">
          {isLoggedIn && (
            <>
              <div className="avatar-dropdown" ref={menuRef}>
                <img
                  src={avatar}
                  alt="avatar"
                  className="avatar-img"
                  onClick={() => setMenuOpen(v => !v)}
                />
                {menuOpen && (
                  <div className="dropdown-menu">
                    <img
                      src={avatar}
                      alt="avatar"
                      className="dropdown-avatar"
                    />
                    <div className="dropdown-nickname">
                      {displayName}
                    </div>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="dropdown-edit-btn"
                    >
                      Edit Information
                    </button>
                    <button
                      onClick={() => setShowPwdModal(true)}
                      className="dropdown-password-btn"
                    >
                      Change Password
                    </button>
                  </div>
                )}
              </div>
              <button className="logout-btn" onClick={onLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
      {showPwdModal && <ChangePasswordModal onClose={() => setShowPwdModal(false)} />}
    </div>
  );
}
