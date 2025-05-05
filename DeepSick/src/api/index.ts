//封装了与后端 API 的交互，包括记忆内容、遗嘱和用户认证相关的操作。自动在请求头中注入 JWT 令牌。
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
export const deleteMemory = (id: string) =>
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

//dreamlist api
// 获取所有梦想清单
export const getDreams = () => API.get('/api/dreams').then(res => res.data);

/*创建新的梦想清单项目 
 * @param {string} content - 梦想内容
 * @param {{x: number, y: number}} [position] - 梦想在页面上的位置坐标(可选)
 * @returns {Promise} 返回创建成功的梦想对象的Promise
 */
export const createDream = (content: string, position?: { x: number, y: number }) =>
    API.post('/api/dreams', { content, position }).then(res => res.data);

// 更新梦想清单项目 id;要更新的字段(可选) 
export const updateDream = (id: string, updates: { content?: string, position?: { x: number, y: number }, order?: number }) =>
    API.patch(`/api/dreams/${id}`, updates).then(res => res.data);

// 删除指定的梦想清单项目 要删除的梦想ID 
export const deleteDream = (id: string) => API.delete(`/api/dreams/${id}`);



//在其他地方想直接拿到 axios 实例：
export default API;