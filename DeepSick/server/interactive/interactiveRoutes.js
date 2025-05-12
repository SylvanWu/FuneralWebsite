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
    // Save music metadata to MongoDB
    const music = await Music.create({
      originalname,
      filename,
      url,
      uploadTime: new Date()
    });
    res.json({
      success: true,
      url,
      filename,
      music
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 献花记录
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
        
        // 获取该房间的献花总数
        const flowerCount = await InteractiveRecord.countDocuments({ 
            roomId,
            type: 'flower' 
        });
        
        res.json({ 
            success: true, 
            record,
            totalCount: flowerCount
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// 获取蜡烛记录
router.get('/candle/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const records = await InteractiveRecord.find({ 
            roomId,
            type: 'candle' 
        }).sort({ timestamp: -1 });
        
        res.json({ 
            success: true, 
            records
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// 点亮蜡烛记录
router.post('/candle/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const { username, candleId } = req.body;

        // 检查该房间的蜡烛是否已被点亮
        const existingCandle = await InteractiveRecord.findOne({
            roomId,
            type: 'candle',
            candleId
        });

        if (existingCandle) {
            return res.status(400).json({
                success: false,
                message: '该蜡烛已被点亮'
            });
        }

        const record = new InteractiveRecord({
            roomId,
            type: 'candle',
            username,
            candleId,
            timestamp: new Date()
        });
        await record.save();
        
        res.json({ 
            success: true, 
            record
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// 留言记录
router.post('/message/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const { username, message } = req.body;

        console.log('Received message request:', { roomId, username, message });

        if (!username || !message) {
            return res.status(400).json({
                success: false,
                message: 'Username and message are required'
            });
        }

        const record = new InteractiveRecord({
            roomId,
            type: 'message',
            username,
            content: message,
            timestamp: new Date()
        });

        console.log('Saving record:', record);

        const savedRecord = await record.save();
        console.log('Record saved successfully:', savedRecord);
        
        res.json({ 
            success: true, 
            record: savedRecord
        });
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// 获取留言记录
router.get('/message/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        console.log('Fetching messages for room:', roomId);

        const records = await InteractiveRecord.find({ 
            roomId,
            type: 'message' 
        })
            .sort({ timestamp: -1 })
            .limit(100);
            
        console.log(`Found ${records.length} messages for room ${roomId}`);
        
        res.json({ 
            success: true, 
            records
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// 获取历史记录
router.get('/:type/:roomId', async (req, res) => {
    try {
        const { type, roomId } = req.params;
        const records = await InteractiveRecord.find({ 
            roomId,
            type 
        })
            .sort({ timestamp: -1 })
            .limit(100);
            
        const totalCount = await InteractiveRecord.countDocuments({ 
            roomId,
            type 
        });
        
        res.json({ 
            success: true, 
            records,
            totalCount 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

export default router; 