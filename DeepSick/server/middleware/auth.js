//JWT中间件函数 authMiddleware,验证 HTTP 请求中的 JWT 令牌，确保请求者身份合法
// 若验证成功，将用户信息挂载到req.user上，否则返回 401 错误。
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
        if (!secret) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('[auth] JWT_SECRET not set. Using default dev secret.');
                secret = 'default_dev_secret';  // 可自定义
            } else {
                throw new Error('JWT_SECRET is required in production');
            }
        }

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
        console.error('JWT verification failed:', err.message);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}