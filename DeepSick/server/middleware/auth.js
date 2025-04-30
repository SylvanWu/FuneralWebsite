import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// JWT 验证中间件
export default function authMiddleware(req, res, next) {
    // 从请求头里取出 Authorization
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // 格式应该是 "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Invalid token format' });
    }

    const token = parts[1];
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET not set in .env');

        // 验证并解码
        const decoded = jwt.verify(token, secret);
        // 把用户信息挂到 req.user 上，后续路由就能拿到
        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role
        };
        next();
    } catch (err) {
        console.error('JWT verification failed:', err);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}