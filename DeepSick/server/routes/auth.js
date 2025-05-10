//处理用户的注册和登录请求。注册时检查用户名是否已存在，若不存在则创建新用户并生成 JWT 令牌；登录时验证用户名和密码，若正确则签发 JWT 令牌。
import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import Organizer from '../models/Organizer.js';
import Visitor from '../models/Visitor.js';
import LovedOne from '../models/LovedOne.js';
import bcrypt from 'bcrypt';

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
router.post('/register', async (req, res) => {
    const { username, password, userType } = req.body;
    
    try {
        let user;
        switch(userType) {
            case 'organizer':
                user = new Organizer({ username, password });
                break;
            case 'visitor':
                user = new Visitor({ username, password });
                break;
            case 'lovedOne':
                user = new LovedOne({ username, password });
                break;
            default:
                return res.status(400).json({ message: '无效的用户类型' });
        }
        
        await user.save();
        res.status(201).json({ message: '注册成功' });
    } catch (error) {
        res.status(500).json({ message: '注册失败', error: error.message });
    }
});

// 用户登录
router.post('/login', async (req, res) => {
    const { username, password, userType } = req.body;
    
    try {
        let user;
        switch(userType) {
            case 'organizer':
                user = await Organizer.findOne({ username });
                break;
            case 'visitor':
                user = await Visitor.findOne({ username });
                break;
            case 'lovedOne':
                user = await LovedOne.findOne({ username });
                break;
            default:
                return res.status(400).json({ message: '无效的用户类型' });
        }

        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // 验证密码
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: '密码错误' });
        }

        // 生成 token
        const token = jwt.sign(
            { 
                userId: user._id,
                userType: userType 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            user: {
                _id: user._id,
                username: user.username,
                nickname: user.nickname,
                userType: userType,
                phone: user.phone,
                email: user.email,
                address: user.address,
                avatar: user.avatar
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: '登录失败', error: error.message });
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

// 修改密码接口
router.put('/password', authMiddleware, async (req, res) => {
    const userId = req.user && req.user.id;
    const { currentPassword, newPassword } = req.body;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Missing password' });

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const ok = await user.comparePassword(currentPassword);
        if (!ok) return res.status(400).json({ message: 'Current password incorrect' });

        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated' });
    } catch (err) {
        console.error('Password update error:', err);
        res.status(500).json({ message: 'Update failed' });
    }
});

export default router;