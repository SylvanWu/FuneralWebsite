import express from 'express';
import Memory from '../models/Memory.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = 'server/uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Create multer instance
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Get all memories (in reverse chronological order)
router.get('/', async (req, res) => {
  try {
    const memories = await Memory.find().sort({ uploadTime: -1 });
    res.json(memories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new memory - use lock to prevent duplicate requests
let uploadInProgress = false;

router.post('/', upload.single('file'), async (req, res) => {
  // Check for duplicate requests
  if (uploadInProgress) {
    return res.status(429).json({ message: 'Processing another upload, please try again later' });
  }
  
  uploadInProgress = true;
  
  try {
    const { uploaderName, memoryType, memoryContent } = req.body;
    
    // Create new memory object
    const newMemory = new Memory({
      uploaderName,
      memoryType,
      memoryContent: req.file ? req.file.path : memoryContent
    });
    
    // Save to database
    const savedMemory = await newMemory.save();
    res.status(201).json(savedMemory);
  } catch (error) {
    console.error('Upload failed:', error.message);
    res.status(400).json({ message: error.message });
  } finally {
    // Release lock
    uploadInProgress = false;
  }
});

export default router; 