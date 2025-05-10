import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import routes from './routes';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// 1. CORS 配置（放在最前面）
app.use(cors({
  origin: (origin, callback) => {
    // 允许所有 localhost 源
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// 2. 处理预检请求
app.options('*', cors());

// 3. 解析 body
app.use(express.json());

// 4. 路由
app.use('/api', routes);

// 5. 数据库连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/deepsick')
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
  });

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
}); 