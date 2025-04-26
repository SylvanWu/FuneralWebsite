import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

// API调用封装
export const fetchMemories = () => API.get('/memories');
export const createMemory = (memoryData) => API.post('/memories', memoryData); 