import React, { useState, useEffect } from 'react';

// 解析JWT令牌
const parseJwt = (token: string) => {
  try {
    // 将base64解码，获取payload部分
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('JWT解析失败:', e);
    return null;
  }
};

export const UserDebug: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [decodedToken, setDecodedToken] = useState<any>(null);
  const [newUserType, setNewUserType] = useState<string>('');
  
  // 从localStorage加载用户数据和token
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const tokenStr = localStorage.getItem('token');
    
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (e) {
        console.error('用户数据解析失败:', e);
      }
    }
    
    if (tokenStr) {
      setToken(tokenStr);
      const decoded = parseJwt(tokenStr);
      setDecodedToken(decoded);
    }
  }, []);
  
  // 更新用户类型
  const updateUserType = () => {
    if (!user || !newUserType) return;
    
    const updatedUser = {
      ...user,
      userType: newUserType
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    alert(`用户类型已更新为: ${newUserType}`);
  };
  
  // 重新登录引导
  const handleRelogin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  
  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">用户权限调试工具</h2>
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <h3 className="font-bold">当前用户信息:</h3>
        {user ? (
          <div>
            <p>用户名: {user.username}</p>
            <p>用户类型: <span className="font-bold">{user.userType}</span></p>
            <p>ID: {user._id}</p>
          </div>
        ) : (
          <p>未登录</p>
        )}
      </div>
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <h3 className="font-bold">JWT Token 信息:</h3>
        {decodedToken ? (
          <div>
            <p>用户ID: {decodedToken.userId}</p>
            <p>用户类型: <span className="font-bold">{decodedToken.userType}</span></p>
            <p>过期时间: {new Date(decodedToken.exp * 1000).toLocaleString()}</p>
          </div>
        ) : (
          <p>无效的 JWT Token</p>
        )}
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <select 
          className="border p-2 rounded" 
          value={newUserType} 
          onChange={(e) => setNewUserType(e.target.value)}
        >
          <option value="">选择用户类型...</option>
          <option value="organizer">organizer</option>
          <option value="visitor">visitor</option>
          <option value="lovedOne">lovedOne</option>
        </select>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          disabled={!newUserType}
          onClick={updateUserType}
        >
          更新用户类型
        </button>
      </div>
      
      <div className="border-t pt-4">
        <p className="text-sm text-gray-600 mb-2">
          注意: 仅更新LocalStorage中的用户类型不会改变JWT token中的权限信息。
          要完全更新权限，需要重新登录。
        </p>
        <button 
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleRelogin}
        >
          清除登录信息并重新登录
        </button>
      </div>
    </div>
  );
};

export default UserDebug; 