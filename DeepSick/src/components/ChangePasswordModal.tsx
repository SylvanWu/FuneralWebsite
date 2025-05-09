import React, { useState } from 'react';
import API from '../api';

export default function ChangePasswordModal({ onClose }) {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (newPwd !== confirmPwd) {
      setMsg('New passwords do not match');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      await API.put('/api/auth/password', {
        currentPassword: currentPwd,
        newPassword: newPwd,
      });
      setMsg('Password changed successfully!');
      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 1200);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Change failed, please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 2px 12px #eee' }}>
        <h3 style={{ textAlign: 'center', marginBottom: 16 }}>Change Password</h3>
        <input
          type="password"
          placeholder="Current Password"
          value={currentPwd}
          onChange={e => setCurrentPwd(e.target.value)}
          style={{ width: '100%', marginBottom: 12, padding: 8 }}
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPwd}
          onChange={e => setNewPwd(e.target.value)}
          style={{ width: '100%', marginBottom: 12, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPwd}
          onChange={e => setConfirmPwd(e.target.value)}
          style={{ width: '100%', marginBottom: 16, padding: 8 }}
        />
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleChange}
            disabled={loading}
            style={{ flex: 1, padding: 10, background: '#4ade80', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            style={{ flex: 1, padding: 10, background: '#eee', color: '#333', border: 'none', borderRadius: 8, fontWeight: 600 }}
          >
            Cancel
          </button>
        </div>
        {msg && <div style={{ marginTop: 12, color: msg.includes('success') ? 'green' : 'red', textAlign: 'center' }}>{msg}</div>}
      </div>
    </div>
  );
}
