import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Will from '../models/Will.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const authMiddleware = auth;

// Setup upload storage
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Ensure upload directory exists
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Configure multer middleware
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'farewell-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create upload middleware
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Handle multer errors
const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ 
      message: 'File upload failed', 
      error: err.message,
      code: err.code
    });
  }
  next(err);
};

router.use(errorHandler);

/* ───── POST  /api/wills  Create a Will ───── */
router.post(
  '/',
  authMiddleware(),
  upload.single('video'),
  async (req, res) => {
    // 添加更广泛的CORS头以解决潜在的跨域问题
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Max-Age', '86400'); // 24小时

    try {
      console.log('[POST /api/wills] Request received');
      console.log('[POST /api/wills] Content-Type:', req.headers['content-type']);
      console.log('[POST /api/wills] Headers:', JSON.stringify(req.headers));
      console.log('[POST /api/wills] Body:', JSON.stringify(req.body, null, 2));
      console.log('[POST /api/wills] File:', req.file ? {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      } : 'No file');
      console.log('[POST /api/wills] User:', req.user || 'No user');

      // 从请求体中提取数据，确保有默认值
      const uploaderName = req.body.uploaderName || 'Anonymous User';
      const farewellMessage = req.body.farewellMessage || 'No message provided';
      const roomId = req.body.roomId;
      
      // 记录关键数据
      console.log('[POST /api/wills] Extracted data:', {
        uploaderName,
        farewellMessageLength: farewellMessage?.length || 0,
        roomId
      });
      
      // 日志文件信息
      if (req.file) {
        console.log('[POST /api/wills] Received file:', {
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype
        });
      }

      if (!roomId) {
        console.log('[POST /api/wills] ERROR: Missing roomId');
        return res.status(400).json({ message: 'Room ID is required to create a will.' });
      }

      // Debug log for request body
      console.log('[POST /api/wills] Debug info:', {
        body: req.body,
        bodyKeys: Object.keys(req.body),
        userId: req.user?.userId,
        userType: req.user?.userType
      });

      // 创建真实的Will记录
      console.log('[POST /api/wills] 开始创建数据库记录');
      
      const newWill = await Will.create({
        owner: req.user?.userId || 'anonymous',
        roomId,
        uploaderName: uploaderName,
        farewellMessage: farewellMessage,
        videoFilename: req.file?.filename || ''
      });

      console.log('[POST /api/wills] Created Will successfully:', newWill);
      res.status(201).json(newWill);

      // 注释掉之前的测试代码
      /*
      // 直接返回成功，跳过数据库操作
      console.log('[POST /api/wills] TESTING: Skipping database operation');
      
      return res.status(201).json({
        _id: 'test-will-id-' + Date.now(),
        owner: req.user?.userId || 'anonymous',
        roomId,
        uploaderName: uploaderName,
        farewellMessage: farewellMessage,
        videoFilename: req.file?.filename || '',
        createdAt: new Date().toISOString()
      });
      */
    } catch (err) {
      // 记录详细错误信息
      console.error('[POST /api/wills] Creation failed:', {
        error: err.message,
        stack: err.stack,
        name: err.name,
        code: err.code
      });
      
      // 发送更友好的错误响应
      res.status(500).json({ 
        message: 'Failed to create will', 
        error: err.message,
        timestamp: new Date().toISOString() 
      });
    }
  }
);

/* ───── PATCH  /api/wills/:id  Edit a Will (Text + Optional New Video) ───── */
router.patch(
  '/:id',
  authMiddleware(),
  upload.single('video'),
  async (req, res) => {
    try {
      const updateFields = {};
      if (req.body.uploaderName) updateFields.uploaderName = req.body.uploaderName;
      if (req.body.farewellMessage) updateFields.farewellMessage = req.body.farewellMessage;
      if (req.file) updateFields.videoFilename = req.file.filename;

      const updated = await Will.findOneAndUpdate(
        { _id: req.params.id },
        updateFields,
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ message: 'Will not found' });
      }
      
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update will', error: err });
    }
  }
);

/* ───── DELETE  /api/wills/:id  Delete a Will ───── */
router.delete(
  '/:id',
  authMiddleware(),
  async (req, res) => {
    try {
      const deleted = await Will.findOneAndDelete({
        _id: req.params.id
      });
      
      if (!deleted) {
        return res.status(404).json({ message: 'Will not found' });
      }
      
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete will', error: err });
    }
  }
);

/* ───── GET  /api/wills  Get All Wills for a Specific Room ───── */
router.get(
  '/',
  authMiddleware(),
  async (req, res) => {
    const { roomId } = req.query;

    if (!roomId) {
      return res.status(400).json({ message: 'Room ID is required to fetch wills.' });
    }

    try {
      const list = await Will.find({ roomId }).sort({ createdAt: -1 });
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch wills', error: err });
    }
  }
);

export default router; 