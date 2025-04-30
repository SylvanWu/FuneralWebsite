// server/index.js
import express            from 'express';
import cors               from 'cors';
import dotenv             from 'dotenv';
import mongoose           from 'mongoose';
import path               from 'path';
import { fileURLToPath }  from 'url';

/* 路由 */
import authRoutes     from './routes/auth.js';
import memoriesRouter from './routes/memories.js';
import willRoutes     from './routes/willRoutes.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5001;

/* ──────────── 公共中间件 ──────────── */
app.use(cors());
app.use(express.json());

/* 把上传目录暴露为静态资源：/uploads/xxx.webm */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(
    '/uploads',
    express.static(
        path.join(__dirname, 'uploads'),
        { acceptRanges: false }
    )
);


/* ──────────── 业务路由 ──────────── */
app.use('/api/auth',     authRoutes);
app.use('/api/memories', memoriesRouter);
app.use('/api/wills',    willRoutes);

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