import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
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

// ... existing code ... 