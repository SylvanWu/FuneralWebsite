//封装了与后端 API 的交互，包括记忆内容、遗嘱和用户认证相关的操作。自动在请求头中注入 JWT 令牌。
// from Xingyuan Zhou, updated by Haoran Li
// src/api/index.ts
import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
});

/* ---------- 注入 JWT ---------- */
API.interceptors.request.use(
    cfg => {
        const token = localStorage.getItem('token');
        if (token) {
            cfg.headers = cfg.headers ?? {};
            cfg.headers.Authorization = `Bearer ${token}`;
        }
        return cfg;
    },
    err => Promise.reject(err),
);

/* ---------- Memories ---------- */
export const fetchMemories = ()        => API.get('/api/memories').then(r => r.data);
export const createMemory  = (fd:FormData) => API.post('/api/memories', fd).then(r => r.data);
export const deleteMemory  = (id:string)  => API.delete(`/api/memories/${id}`);

/* ---------- Wills ---------- */
export const getWills   = ()                 => API.get('/api/wills').then(r => r.data);
export const createWill = (fd:FormData)      => API.post('/api/wills', fd).then(r => r.data);
export const deleteWill = (id:string)        => API.delete(`/api/wills/${id}`);

/**
 * 更新遗嘱
 * @param id       will _id
 * @param data     普通 JSON 或 FormData
 * @param isForm   若为 true，则 data 必须是 FormData，会自动走 multipart/form‑data
 */
export const updateWill = (
    id: string,
    data: Partial<{ uploaderName: string; farewellMessage: string }> | FormData,
    isForm = false,
) => {
    if (isForm && data instanceof FormData) {
        return API.patch(`/api/wills/${id}`, data, {
            // 让 axios 自动带 boundary
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(r => r.data);
    }
    return API.patch(`/api/wills/${id}`, data).then(r => r.data);
};

/* ---------- Auth ---------- */
export const registerUser = (p:{ username:string; password:string; role:string }) =>
    API.post('/api/auth/register', p).then(r => r.data);

export const loginUser = (p:{ username:string; password:string }) =>
    API.post('/api/auth/login', p).then(r => r.data);

export default API;