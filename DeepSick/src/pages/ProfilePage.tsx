import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api'; // Your axios instance
import defaultAvatar from '../assets/avatar.png';

const backend = 'http://localhost:5001'; // Your backend address

function getAvatarUrl(avatar: string) {
  if (!avatar || avatar === defaultAvatar) return defaultAvatar;
  if (avatar.startsWith('/uploads')) return backend + avatar;
  return avatar;
}

export default function ProfilePage() {
  const navigate = useNavigate();

  // Read user info from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  console.log("👤 User data from localStorage:", user); // Debug log

  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [address, setAddress] = useState(user.address || '');
  const [avatar, setAvatar] = useState(user.avatar || defaultAvatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [nickname, setNickname] = useState(user.nickname || user.username || '');

  // Upload avatar to server
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatar(URL.createObjectURL(file)); // Preview avatar
    }
  };

  // Save profile
  const handleSave = async () => {
    setLoading(true);
    setMsg('');
    let avatarUrl = avatar;
    try {
      // 1. Upload avatar first
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const uploadRes = await API.post('/api/auth/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        avatarUrl = uploadRes.data.url;
        if (avatarUrl.startsWith('/uploads')) {
          avatarUrl = 'http://localhost:5001' + avatarUrl;
        }
        setAvatar(avatarUrl);
      }
      // 2. Update user info
      const res = await API.put('/auth/profile', {
        nickname,
        email,
        address,
        avatar: avatarUrl,
      });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setMsg('Saved successfully!');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setMsg('Save failed, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 2px 12px #eee' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Edit Profile</h2>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <img
          src={getAvatarUrl(avatar)}
          alt="avatar"
          style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid #eee', objectFit: 'cover' }}
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.src = defaultAvatar; }}
        />
        <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ marginTop: 8 }} />
        <div style={{ fontSize: 12, color: '#888' }}>Upload Avatar</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Username:</label>
        <input value={username} readOnly style={{ width: '100%', background: '#f5f5f5' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Nickname:</label>
        <input value={nickname} onChange={e => setNickname(e.target.value)} style={{ width: '100%' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Email:</label>
        <input value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Address:</label>
        <input value={address} onChange={e => setAddress(e.target.value)} style={{ width: '100%' }} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={handleSave}
          disabled={loading}
          style={{ flex: 1, padding: 10, background: '#4ade80', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={() => navigate('/')}
          disabled={loading}
          style={{ flex: 1, padding: 10, background: '#eee', color: '#333', border: 'none', borderRadius: 8, fontWeight: 600 }}
        >
          Cancel
        </button>
      </div>
      {msg && <div style={{ marginTop: 12, color: msg.includes('success') ? 'green' : 'red', textAlign: 'center' }}>{msg}</div>}
    </div>
  );
}
