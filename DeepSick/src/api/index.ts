// from Xingyuan Zhou, updated by Haoran Li
// src/api/index.ts
import axios from 'axios';

// 从 .env 读取后端地址，回退到本地 5001 端口
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001'
});

// —— 自动注入 JWT ——
API.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// ── Memories 模块 ──────────────────────
// 注意：后端是 app.use('/memories', …)
export const fetchMemories = () =>
    API.get('/api/memories').then(res => res.data);
export const createMemory = (data: FormData) =>
    API.post('/api/memories', data).then(res => res.data);
export const deleteMemory   = (id: string) =>
    API.delete(`/api/memories/${id}`);

// ── Wills 模块 ─────────────────────────
// 后端是 app.use('/api/wills', willRoutes)
export const getWills = () =>
    API.get('/api/wills').then(res => res.data);
export const createWill = (formData: FormData) =>
    API.post('/api/wills', formData).then(res => res.data);

export const deleteWill = (id: string) =>
    API.delete(`/api/wills/${id}`);

export const updateWill = (
    id: string,
    body: { uploaderName?: string; farewellMessage?: string }
) => API.patch(`/api/wills/${id}`, body).then(r => r.data);



// ── Auth 模块 ─────────────────────────
export const registerUser = (payload: {
    username: string;
    password: string;
    role: string;
}) => API.post('/api/auth/register', payload).then(res => res.data);

export const loginUser = (payload: {
    username: string;
    password: string;
}) => API.post('/api/auth/login', payload).then(res => res.data);

//在其他地方想直接拿到 axios 实例：
export default API;