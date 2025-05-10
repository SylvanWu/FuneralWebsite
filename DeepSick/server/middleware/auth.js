//JWT中间件函数 authMiddleware,验证 HTTP 请求中的 JWT 令牌，确保请求者身份合法
// 若验证成功，将用户信息挂载到req.user上，否则返回 401 错误。
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// JWT 验证中间件
const auth = (userType) => async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: '未授权' });
    }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.userType !== userType) {
            return res.status(403).json({ message: '权限不足' });
            }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: '无效的token' });
    }
};

export default auth;