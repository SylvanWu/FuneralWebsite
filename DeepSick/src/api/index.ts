// Encapsulates interactions with the backend API, including memories, wills, and user authentication.
// Automatically injects the JWT token into the request headers.
// from Xingyuan Zhou, updated by Haoran Li
// src/api/index.ts
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const API = axios.create({ baseURL });

/* ---------- inject the JWT token ---------- */
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
export const fetchMemories = (roomId?: string) => {
    const endpoint = roomId ? `/memories?roomId=${roomId}` : '/memories';
    return API.get(endpoint).then(r => r.data);
};

export const createMemory = (fd: FormData) => {
    return API.post('/memories', fd, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    .then(r => {
        console.log('Memory creation response:', r.data);
        return r.data;
    })
    .catch(error => {
        console.error('Memory creation error:', error.response || error);
        throw error;
    });
};

export const deleteMemory = (id: string) => API.delete(`/memories/${id}`);

/* ---------- Wills ---------- */
export const getWills   = ()                 => API.get('/wills').then(r => r.data);
export const createWill = (fd: FormData) =>
  API.post('/wills', fd).then(r => r.data);
export const deleteWill = (id:string)        => API.delete(`/wills/${id}`);

/**
 * Update a will
 * @param id       will _id
 * @param data     Plain JSON or FormData
 * @param isForm   If true, the data must be FormData and will automatically use multipart/form-data
 */
export const updateWill = (
    id: string,
    data: Partial<{ uploaderName: string; farewellMessage: string }> | FormData,
    isForm = false,
) => {
    if (isForm && data instanceof FormData) {
        return API.patch(`/wills/${id}`, data, {
            // 让 axios 自动带 boundary
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(r => r.data);
    }
    return API.patch(`/wills/${id}`, data).then(r => r.data);
};

/* ---------- Auth ---------- */
export const registerUser = (p:{ username:string; password:string; role:string }) =>
    API.post('/auth/register', p).then(r => {
        localStorage.setItem('token', r.data.token);
        return r.data;
    });

export const loginUser = (payload: {
    username: string;
    password: string;
}) => API.post('/auth/login', payload).then(res => {
    localStorage.setItem('token', res.data.token);
    return res.data;
});

//dreamlist api
// Fetch all dream list items
export const getDreams = () => API.get('/dreams').then(res => res.data);

/*Create a new dream list item
 * * @param {string} content - Dream content  
 * @param {{x: number, y: number}} [position] - (Optional) Position of the dream item on the page  
 * @returns {Promise} A Promise that resolves to the created dream item
 */
export const createDream = (content: string, position?: { x: number, y: number }) =>
    API.post('/dreams', { content, position }).then(res => res.data);

// Update a dream list item by ID; fields to update (optional) 
export const updateDream = (id: string, updates: { content?: string, position?: { x: number, y: number }, order?: number }) =>
    API.patch(`/dreams/${id}`, updates).then(res => res.data);

// Delete the specified dream list item by ID
export const deleteDream = (id: string) => API.delete(`/dreams/${id}`);

// Key point: Automatically handle 401 (unauthorized) errors
API.interceptors.response.use(
    res => res,
    err => {
        if (err.response && err.response.status === 401 && localStorage.getItem('token')) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default API;

  