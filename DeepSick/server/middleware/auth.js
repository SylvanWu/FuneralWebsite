// JWT middleware function `authMiddleware` verifies the JWT token in HTTP requests to ensure the requester is authenticated
// If verification succeeds, attaches user info to `req.user`; otherwise responds with 401 Unauthorized
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure the .env file is properly loaded
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Debug logs
console.log('=== JWT Configuration ===');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);
console.log('Current directory:', __dirname);
console.log('Env file path:', path.join(__dirname, '..', '.env'));

const JWT_SECRET = process.env.JWT_SECRET || 'your_very_long_and_secure_secret_key_at_least_32_chars';

// JWT verification middleware
const auth = (userType) => async (req, res, next) => {
    console.log('authMiddleware: start');
    try {
        console.log('=== Auth Middleware Start ===');
        console.log('Headers:', req.headers);
        console.log('Authorization:', req.headers.authorization);
        
        const token = req.headers.authorization?.split(' ')[1];
        console.log('Extracted token:', token);
        
        if (!token) {
            console.log('No token found in request');
            return res.status(401).json({ message: 'Unauthorized' });
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
            return res.status(403).json({ message: 'Forbidden' });
        }

        console.log('=== Auth Middleware Passed ===');
        console.log('authMiddleware: end');
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(401).json({ 
            message: 'Invalid token', 
            error: error.message 
        });
    }
};

export default auth;
