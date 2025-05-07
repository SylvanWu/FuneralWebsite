// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
/* 路由 */
import authRoutes from './routes/auth.js';
import memoriesRouter from './routes/memories.js';
import willRoutes from './routes/willRoutes.js';
import dreamRouter from './routes/dreamRoutes.js';
import interactiveRoutes from './routes/interactiveRoutes.js';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5001;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 统一的上传目录
const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });   // 保证目录存在

// require('dotenv').config()


/* ──────────── 公共中间件 ──────────── */
app.use(cors({
    origin: true,
    methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','Range'],
    exposedHeaders: ['Accept-Ranges','Content-Range','Content-Length']
}));

app.use(express.json());


app.use('/uploads',
    express.static(UPLOAD_DIR, { acceptRanges:false })
    );


/* ──────────── 业务路由 ──────────── */
app.use('/api/auth', authRoutes);
app.use('/api/memories', memoriesRouter);
app.use('/api/wills', willRoutes);
//can:dreamRouter
app.use('/api/dreams', dreamRouter);
app.use('/api/interactive', interactiveRoutes);

/* 默认根路由 (健康检查) */
app.get('/', (_, res) => res.send('Digital Memorial Hall API'));

/* ──────────── 连接 MongoDB 并启动服务器 ──────────── */
mongoose
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/memorial')
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('DB connection error:', err));