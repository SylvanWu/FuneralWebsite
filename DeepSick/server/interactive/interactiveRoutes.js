import express from 'express';
import { InteractiveRecord } from '../models/InteractiveRecord.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Music from '../models/Music.js';

const router = express.Router();

// Set up music upload directory
const musicDir = path.join(process.cwd(), 'server', 'uploads', 'music');
if (!fs.existsSync(musicDir)) {
  fs.mkdirSync(musicDir, { recursive: true });
}

const musicStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, musicDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const uploadMusic = multer({ storage: musicStorage });

// Music upload API
router.post('/music/upload', uploadMusic.single('music'), async (req, res) => {
  try {
    const { originalname, filename } = req.file;
    const url = `/uploads/music/${filename}`;
    const music = await Music.create({
      originalname,
      filename,
      url,
      uploadTime: new Date()
    });
    res.json({ success: true, url, filename, music });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Flower offering records
router.post('/flower/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { username, flowerType } = req.body;
    const record = new InteractiveRecord({
      roomId,
      type: 'flower',
      username,
      flowerType,
      timestamp: new Date()
    });
    await record.save();
    const flowerCount = await InteractiveRecord.countDocuments({ roomId, type: 'flower' });
    res.json({ success: true, record, totalCount: flowerCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get candle lighting records
router.get('/candle/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const records = await InteractiveRecord.find({ roomId, type: 'candle' }).sort({ timestamp: -1 });
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Record candle lighting
router.post('/candle/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { username, candleId } = req.body;
    const existingCandle = await InteractiveRecord.findOne({ roomId, type: 'candle', candleId });
    if (existingCandle) {
      return res.status(400).json({ success: false, message: 'The candle has lighted up' });
    }
    const record = new InteractiveRecord({
      roomId,
      type: 'candle',
      username,
      candleId,
      timestamp: new Date()
    });
    await record.save();
    res.json({ success: true, record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Message records
router.post('/message/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { username, message } = req.body;
    if (!username || !message) {
      return res.status(400).json({ success: false, message: 'Username and message are required' });
    }
    const record = new InteractiveRecord({
      roomId,
      type: 'message',
      username,
      content: message,
      timestamp: new Date()
    });
    const savedRecord = await record.save();
    res.json({ success: true, record: savedRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get message records
router.get('/message/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const records = await InteractiveRecord.find({ roomId, type: 'message' })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get history records by type and roomId
router.get('/:type/:roomId', async (req, res) => {
  try {
    const { type, roomId } = req.params;
    const records = await InteractiveRecord.find({ roomId, type })
      .sort({ timestamp: -1 })
      .limit(100);
    const totalCount = await InteractiveRecord.countDocuments({ roomId, type });
    res.json({ success: true, records, totalCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
