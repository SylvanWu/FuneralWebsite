// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { loginUser } from '../api/index';   // loginUser 返回 { user, token }
import { useNavigate } from 'react-router-dom';
import API from '../api/index';             // 拿到 axios 实例

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // loginUser 直接 resolve 到 { user, token }
            const res = await loginUser({ username, password });
            const token = res.token;             // ← 直接 res.token，而不是 res.data.token
            // 1) 存到 localStorage
            localStorage.setItem('token', token);
            // 2) 立刻设置到 axios 默认头
            API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // 跳转到遗嘱列表页
            navigate('/wills');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <main className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded">
            <h1 className="text-2xl mb-4">Sign In</h1>
            {error && <div className="mb-3 text-red-600">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1">Username</label>
                    <input
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>
                <div>
                    <label className="block mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-2 bg-gray-800 text-white rounded"
                >
                    Sign In
                </button>
            </form>
        </main>
    );
}