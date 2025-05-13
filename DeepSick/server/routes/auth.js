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
  const { username, password, userType } = req.body;

  try {
    // 1. Select correct Mongoose model based on userType
    let Model;
    switch (userType) {
      case 'organizer':
        Model = Organizer;
        break;
      case 'visitor':
        Model = Visitor;
        break;
      case 'lovedOne':
        Model = LovedOne;
        break;
      default:
        return res.status(400).json({ message: 'Invalid user type' });
    }

    // 2. Check if username is already taken
    const existing = await Model.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // 3. Hash the password
    const hashedPwd = await bcrypt.hash(password, 10);

    // 4. Create and save the new user
    const user = new Model({ username, password: hashedPwd });
    await user.save();

    // 5. Respond with success
    return res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    // Handle unique index violation (if schema enforces unique constraint)
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Registration failed', error: error.message });
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

// ... keep the rest of your routes (profile, avatar, password) unchanged ...

export default router;
