//处理用户的注册和登录请求。注册时检查用户名是否已存在，若不存在则创建新用户并生成 JWT 令牌；登录时验证用户名和密码，若正确则签发 JWT 令牌。
import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

dotenv.config();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'default_dev_secret';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), 'server/uploads'));
    },
    filename: function (req, file, cb) {
        // 保证文件名唯一
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
    }
});
const upload = multer({ storage });

// 注册新用户
router.post('/register', async(req, res) => {
    const { username, password, role, phone, email, address, avatar } = req.body;
    try {
        const existing = await User.findOne({ username });
        if (existing) return res.status(409).json({ message: 'Username taken' });

        const user = new User({ username, password, role, phone, email, address, avatar });
        await user.save();

        // 生成 JWT
        const token = jwt.sign({ id: user._id, username: user.username, role: user.role },
            JWT_SECRET, { expiresIn: '7d' }
        );

        res.status(201).json({
            user: {
                _id: user._id,
                username: user.username,
                role: user.role,
                phone: user.phone,
                email: user.email,
                address: user.address,
                avatar: user.avatar
            },
            token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Register failed' });
    }
});

// 用户登录
router.post('/login', async(req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const ok = await user.comparePassword(password);
        if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

        // 签发 JWT
        const token = jwt.sign({ id: user._id, username: user.username, role: user.role },
            JWT_SECRET, { expiresIn: '7d' }
        );

        res.json({
            user: {
                _id: user._id,
                username: user.username,
                role: user.role,
                phone: user.phone,
                email: user.email,
                address: user.address,
                avatar: user.avatar
            },
            token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Login failed' });
    }
});

// 更新用户信息
router.put('/profile', authMiddleware, async (req, res) => {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { nickname, phone, email, address, avatar } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { nickname, phone, email, address, avatar },
            { new: true }
        );
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({
            user: {
                _id: user._id,
                username: user.username,
                nickname: user.nickname,
                role: user.role,
                phone: user.phone,
                email: user.email,
                address: user.address,
                avatar: user.avatar
            }
        });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ message: 'Update failed' });
    }
});

// 上传头像接口
router.post('/avatar', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // 返回图片的可访问 URL
    res.json({ url: `/uploads/${req.file.filename}` });
});

export default router;