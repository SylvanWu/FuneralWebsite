//处理用户的注册和登录请求。注册时检查用户名是否已存在，若不存在则创建新用户并生成 JWT 令牌；登录时验证用户名和密码，若正确则签发 JWT 令牌。
import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();
const router = express.Router();

// 注册新用户
router.post('/register', async(req, res) => {
    const { username, password, role } = req.body;
    try {
        const existing = await User.findOne({ username });
        if (existing) return res.status(409).json({ message: 'Username taken' });

        const user = new User({ username, password, role });
        await user.save();

        // 生成 JWT
        const token = jwt.sign({ id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '7d' }
        );

        res.status(201).json({
            user: { _id: user._id, username: user.username, role: user.role },
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
        console.log(await User.find({}));
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const ok = await user.comparePassword(password);
        if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

        // 签发 JWT
        const token = jwt.sign({ id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '7d' }
        );

        res.json({
            user: { _id: user._id, username: user.username, role: user.role },
            token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Login failed' });
    }
});

export default router;