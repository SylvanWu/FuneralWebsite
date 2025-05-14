// Handles user registration and login requests.
// During registration, checks whether the username already exists.
// If not, creates a new user and generates a JWT token.
// During login, verifies the username and password,
// and issues a JWT token if correct.

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
console.log('JWT_SECRET:', JWT_SECRET);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), 'server/uploads'));
    },
    filename: function (req, file, cb) {
        // Ensure unique file name
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
    }
});
const upload = multer({ storage });

// Register new user
router.post('/register', async (req, res) => {
    const { username, password, userType, email } = req.body;
    
    try {
        // 1. Encrypt password
        const hashedPwd = await bcrypt.hash(password, 10);

        let user;
        switch(userType) {
            case 'organizer':
                user = new Organizer({ username, password: hashedPwd, email });
                break;
            case 'visitor':
                user = new Visitor({ username, password: hashedPwd, email });
                break;
            case 'lovedOne':
                user = new LovedOne({ username, password: hashedPwd, email });
                break;
            default:
                return res.status(400).json({ message: 'Invalid user type' });
        }
        
        await user.save();
        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// User login
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
                return res.status(400).json({ message: 'Invalid user type' });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Login username:', username, 'userType:', userType);
        console.log('Password in DB:', user.password);
        console.log('Password from client:', password);

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, userType: userType },
            JWT_SECRET,
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
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// Update user profile
router.put('/profile', authMiddleware(), async (req, res) => {
    console.log('=== 收到 /auth/profile PUT 请求 ===');
    // Get userId and userType from the authenticated user (set by authMiddleware)
    const userId = req.user?.userId;
    const userType = req.user?.userType;
    console.log(`[PUT /auth/profile] userId: ${userId}, userType: ${userType}`); // Log user info

    if (!userId || !userType) {
        console.error("[PUT /auth/profile] Unauthorized: Missing userId or userType in token");
        return res.status(401).json({ message: 'Unauthorized or missing user info in token' });
    }

    // Destructure only the relevant fields from request body (exclude phone)
    const { nickname, email, address, avatar } = req.body;
    const updateData = { nickname, email, address, avatar };
    console.log("[PUT /auth/profile] Update data from body:", updateData); // Log update data

    try {
        let UserModel;
        console.log("[PUT /auth/profile] Determining user model..."); // Log before switch
        // Determine the correct model based on userType
        switch(userType) {
            case 'organizer':
                UserModel = Organizer;
                console.log("[PUT /auth/profile] Using Organizer model");
                break;
            case 'visitor':
                UserModel = Visitor;
                console.log("[PUT /auth/profile] Using Visitor model");
                break;
            case 'lovedOne':
                UserModel = LovedOne;
                console.log("[PUT /auth/profile] Using LovedOne model");
                break;
            default:
                console.error(`[PUT /auth/profile] Invalid user type in token: ${userType}`);
                return res.status(400).json({ message: 'Invalid user type in token' });
        }

        // Use the specific UserModel to find and update
        console.log(`[PUT /auth/profile] Attempting findByIdAndUpdate for userId: ${userId}`); // Log before DB call
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            updateData, // Use the cleaned updateData object
            { new: true, runValidators: true } // Return updated doc, run schema validators
        );
        console.log("[PUT /auth/profile] findByIdAndUpdate result:", updatedUser); // Log after DB call

        if (!updatedUser) {
            console.warn(`[PUT /auth/profile] User not found for userId: ${userId}`);
            return res.status(404).json({ message: 'User not found' });
        }

        // Construct the response payload correctly
        const responsePayload = {
            user: {
                _id: updatedUser._id,
                username: updatedUser.username,
                nickname: updatedUser.nickname,
                userType: userType,
                email: updatedUser.email,
                address: updatedUser.address,
                avatar: updatedUser.avatar
            }
        };
        console.log("[PUT /auth/profile] Sending success response:", responsePayload); // Log before response
        res.json(responsePayload);

    } catch (err) {
        // Log the full error details
        console.error('[PUT /auth/profile] Error during profile update:', {
            name: err.name,
            message: err.message,
            stack: err.stack,
            userId: userId,
            userType: userType,
            updateData: updateData
        });
        res.status(500).json({ message: 'Update failed', error: err.message });
    }
});

// Upload avatar
router.post('/avatar', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // Return accessible image URL
    res.json({ url: `/uploads/${req.file.filename}` });
});

// Change password
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

// JWT auth middleware
const auth = (userType) => async (req, res, next) => {
    try {
        // Check JWT_SECRET
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured');
            return res.status(500).json({ 
                message: 'Server configuration error',
                error: 'JWT_SECRET not configured'
            });
        }

        const authHeader = req.headers.authorization;
        console.log('Auth header:', authHeader);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Invalid authorization header' });
        }
        
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token not provided' });
        }
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decoded:', decoded);
            
            if (userType && decoded.userType !== userType) {
                return res.status(403).json({ 
                    message: 'Insufficient permissions',
                    required: userType,
                    got: decoded.userType
                });
            }
            
            req.user = decoded;
            next();
        } catch (jwtError) {
            console.error('JWT verification failed:', jwtError);
            return res.status(401).json({ 
                message: 'Token verification failed',
                error: jwtError.message
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export default router;
