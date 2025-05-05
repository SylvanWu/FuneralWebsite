//处理与记忆内容相关的路由请求，包括获取所有记忆内容、上传新的记忆内容和删除记忆内容。使用 multer 进行文件上传，并在删除记忆内容时尝试删除对应的文件。
// routes/memories.js

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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
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

// Add new memory (no global lock)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { uploaderName, memoryType, memoryContent } = req.body;

    const newMemory = new Memory({
      uploaderName,
      memoryType,
      memoryContent: req.file ? req.file.path : memoryContent
    });

    const savedMemory = await newMemory.save();
    res.status(201).json(savedMemory);
  } catch (error) {
    console.error('Upload failed:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// Delete a memory by ID
router.delete('/:id', async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    // Try to delete uploaded file if it's an image or video
    if ((memory.memoryType === 'image' || memory.memoryType === 'video') &&
        memory.memoryContent && memory.memoryContent.startsWith(uploadDir)) {
      try {
        if (fs.existsSync(memory.memoryContent)) {
          fs.unlinkSync(memory.memoryContent);
        }
      } catch (fileError) {
        console.error('Failed to delete file:', fileError);
        // Continue deleting from DB even if file deletion fails
      }
    }

    // Delete memory from DB
    await Memory.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Memory deleted successfully' });
  } catch (error) {
    console.error('Delete failed:', error.message);
    res.status(500).json({ message: error.message });
  }
});

export default router;