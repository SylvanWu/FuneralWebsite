// Handles user registration and login requests.
// During registration, checks whether the username already exists.
// If not, creates a new user and generates a JWT token.
// During login, verifies the username and password,
// and issues a JWT token if correct.

// server/routes/auth.js

import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import path from 'path';
import multer from 'multer';

import Organizer from '../models/Organizer.js';
import Visitor from '../models/Visitor.js';
import LovedOne from '../models/LovedOne.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default_dev_secret';

// configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'server/uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});
const upload = multer({ storage });

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 *          1. Check for duplicate username
 *          2. Hash password
 *          3. Save user document
 *          4. Return 201 on success, 409 on conflict
 */
router.post('/register', async (req, res) => {
    const { username, password, userType, email } = req.body;
    try {
        const hashedPwd = await bcrypt.hash(password, 10);
        let user;
        switch(userType) {
            case 'organizer':
                user = new Organizer({ username, password: hashedPwd, email });
                break;
            case 'visitor':
                user = new Visitor({ username, password: hashedPwd, email });
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

/**
 * @route   POST /auth/login
 * @desc    Authenticate user and issue JWT
 */
router.post('/login', async (req, res) => {
  const { username, password, userType } = req.body;

    try {
    let user;
    switch (userType) {
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

    // Compare submitted password with stored hash
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Generate JWT token
        const token = jwt.sign(
      { userId: user._id, userType },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send user info + token
    res.json({
      user: {
        _id: user._id,
        username: user.username,
        nickname: user.nickname,
        userType,
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
    const userId = req.user?.userId;
    const userType = req.user?.userType;
    if (!userId || !userType) return res.status(401).json({ message: 'Unauthorized' });

    const { nickname, email, address, avatar } = req.body;
    const updateData = { nickname, email, address, avatar };

    try {
        let UserModel;
        switch(userType) {
            case 'organizer':
                UserModel = Organizer;
                break;
            case 'visitor':
                UserModel = Visitor;
                break;
            default:
                return res.status(400).json({ message: 'Invalid user type in token' });
        }
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.json({
            user: {
                _id: updatedUser._id,
                username: updatedUser.username,
                nickname: updatedUser.nickname,
                userType: userType,
                email: updatedUser.email,
                address: updatedUser.address,
                avatar: updatedUser.avatar
            }
        });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ message: 'Update failed' });
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
