//JWT中间件函数 authMiddleware,验证 HTTP 请求中的 JWT 令牌，确保请求者身份合法
// 若验证成功，将用户信息挂载到req.user上，否则返回 401 错误。
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 确保正确加载 .env 文件
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// 添加调试日志
console.log('=== JWT Configuration ===');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);
console.log('Current directory:', __dirname);
console.log('Env file path:', path.join(__dirname, '..', '.env'));

const JWT_SECRET = process.env.JWT_SECRET || 'your_very_long_and_secure_secret_key_at_least_32_chars';

// JWT 验证中间件
const auth = (userType) => async (req, res, next) => {
    try {
        console.log('=== Auth Middleware Start ===');
        console.log('Headers:', req.headers);
        console.log('Authorization:', req.headers.authorization);
        
        const token = req.headers.authorization?.split(' ')[1];
        console.log('Extracted token:', token);
        
        if (!token) {
            console.log('No token found in request');
            return res.status(401).json({ message: '未授权' });
        }

        console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
        console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);
        
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded token:', decoded);
        
        req.user = decoded;

        if (userType && decoded.userType !== userType) {
            console.log('UserType mismatch:', {
                required: userType,
                got: decoded.userType
            });
            return res.status(403).json({ message: '权限不足' });
        }

        console.log('=== Auth Middleware Passed ===');
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(401).json({ 
            message: '无效的token', 
            error: error.message 
        });
    }
};

export default auth;